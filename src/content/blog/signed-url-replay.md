<!--
meta
{
	"title": "Signed URL replay in middleware",
	"excerpt": "Example writeup showing how a signed asset URL was replayed and how to harden the flow.",
	"date": "2026-05-05",
	"category": "security",
	"readTime": "6 min read",
	"tags": ["edge", "auth", "middleware"]
}
-->
# Signed URL Replay in Middleware

<a id="context"></a>
<a id="context"></a>
## 1. Context
A private reports bucket used signed URLs from edge middleware. URLs were meant to be short lived and bound to an authenticated session.

<a id="summary"></a>
<a id="summary"></a>
## 2. Executive summary
Signed asset URLs were valid without session binding, allowing replay by unauthenticated users. The fix was to bind the token to a session hash, enforce a one time nonce, and reduce TTL to 2 minutes.

<a id="threat-model"></a>
<a id="threat-model"></a>
## 3. Threat model
- Assets: private PDF reports in object storage.
- Entry points: middleware signed URL endpoint and static asset path.
- Trust boundaries: browser session cookie, edge middleware, storage service.
- Attacker goal: exfiltrate private assets by reusing a captured URL.

<a id="recon"></a>
<a id="recon"></a>
## 4. Recon and enumeration
- Observed a signed URL returned after authenticated navigation.
- Confirmed the URL contained signature, expiry, and key id parameters.
- Noted middleware validated signature only, not session context.

<a id="exploit"></a>
<a id="exploit"></a>
## 5. Exploit path
1. Capture a signed URL from an authenticated session.
2. Remove session cookies and replay the URL in a new browser.
3. Asset loads because middleware only verifies signature validity.

Example replay request:

```
GET /private/reports/2026-q1.pdf?sig=...&exp=1714899999&kid=edge-v1
```

<a id="evidence"></a>
<a id="evidence"></a>
## 6. Evidence and artifacts
- Request ID: 9f1a-7c2b-4d1e
- Replay window: 11 minutes
- Affected endpoint: /private/reports/2026-q1.pdf

<a id="fix"></a>
<a id="fix"></a>
## 7. Fix and hardening
- Bind token to a session hash and include it in the signature.
- Add a one time nonce stored server side with a short TTL.
- Reduce URL TTL to 2 minutes and log replay attempts.
- Add a regression test for replay without session cookies.

<a id="lessons"></a>
<a id="lessons"></a>
## 8. Lessons learned
- Treat signed URLs as bearer tokens and always bind to identity.
- Log signature mismatches and replay attempts for early detection.
