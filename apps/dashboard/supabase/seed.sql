-- Seeds the full platform matrix from platform-sync-research.md. Idempotent (upsert on slug) so
-- it is safe to re-run.
--
-- icon_kind/icon_ref convention matches portfolio-data-inventory.md lines 422-423 (the existing
-- project convention, so Phase 9's CMS tables don't collide with a second vocabulary):
-- 'react-icons' + the exact react-icons/si export name (e.g. "SiCodewars"), resolved through a
-- static TS map in code, matching the createImageIcon() pattern already used in techIcons.tsx;
-- 'initial' + a short text fallback for platforms with no react-icons/si entry. Coverage checked
-- directly against node_modules/react-icons/si/index.d.ts, not assumed.
--
-- sync_adapter is non-null only for codewars and codeforces (the two adapters built in B0.7).
-- Every other row starts null and lights up later by updating this column, no code change.
--
-- import_hint is set for the three ToS-flagged priority platforms (leetcode, tryhackme,
-- hackthebox) where Gerald pastes his own solved list instead of an automated sync.

insert into platforms (slug, name, category, url, icon_kind, icon_ref, brand_color, sync_adapter, import_hint, sort_order)
values
  ('leetcode', 'LeetCode', 'swe', 'https://leetcode.com', 'react-icons', 'SiLeetcode', '#FFA116', null,
    'Paste your solved list from leetcode.com/progress (or your submissions page). LeetCode''s ToS forbids automated crawling/scraping.', 1),
  ('hackerrank', 'HackerRank', 'swe', 'https://www.hackerrank.com', 'react-icons', 'SiHackerrank', '#00EA64', null, null, 2),
  ('codesignal', 'CodeSignal', 'swe', 'https://codesignal.com', 'react-icons', 'SiCodesignal', '#1062FB', null, null, 3),
  ('codewars', 'Codewars', 'swe', 'https://www.codewars.com', 'react-icons', 'SiCodewars', '#B1361E', 'codewars', null, 4),
  ('exercism', 'Exercism', 'swe', 'https://exercism.org', 'react-icons', 'SiExercism', '#009CAB', null, null, 5),
  ('codechef', 'CodeChef', 'swe', 'https://www.codechef.com', 'react-icons', 'SiCodechef', '#5B4638', null, null, 6),
  ('codeforces', 'Codeforces', 'swe', 'https://codeforces.com', 'react-icons', 'SiCodeforces', '#1F8ACB', 'codeforces', null, 7),
  ('topcoder', 'TopCoder', 'swe', 'https://www.topcoder.com', 'react-icons', 'SiTopcoder', '#29A7DF', null, null, 8),
  ('neetcode', 'NeetCode', 'swe', 'https://neetcode.io', 'initial', 'N', '#1A1A2E', null, null, 9),
  ('project-euler', 'Project Euler', 'swe', 'https://projecteuler.net', 'initial', 'PE', '#2E3192', null, null, 10),
  ('atcoder', 'AtCoder', 'swe', 'https://atcoder.jp', 'initial', 'AC', '#222222', null, null, 11),
  ('spoj', 'SPOJ', 'swe', 'https://www.spoj.com', 'react-icons', 'SiSpoj', '#2A6496', null, null, 12),
  ('advent-of-code', 'Advent of Code', 'swe', 'https://adventofcode.com', 'react-icons', 'SiAdventofcode', '#FFFF66', null, null, 13),
  ('kaggle', 'Kaggle', 'swe', 'https://www.kaggle.com', 'react-icons', 'SiKaggle', '#20BEFF', null, null, 14),
  ('tryhackme', 'TryHackMe', 'cyber', 'https://tryhackme.com', 'react-icons', 'SiTryhackme', '#212C42', null,
    'Paste your completed-rooms list from your TryHackMe public profile page. TryHackMe''s AUP broadly restricts automated access -- confirm your own comfort with this before relying on it.', 15),
  ('hackthebox', 'Hack The Box', 'cyber', 'https://www.hackthebox.com', 'react-icons', 'SiHackthebox', '#9FEF00', null,
    'Paste your solved machines/challenges from your HTB profile. HTB''s AUP restricts compiling API responses into a dataset -- confirm your own comfort with this before relying on it.', 16),
  ('picoctf', 'picoCTF', 'cyber', 'https://picoctf.org', 'initial', 'PICO', '#0057B7', null, null, 17),
  ('overthewire', 'OverTheWire', 'cyber', 'https://overthewire.org', 'initial', 'OTW', '#4B4B4B', null, null, 18),
  ('vulnhub', 'VulnHub', 'cyber', 'https://www.vulnhub.com', 'initial', 'VH', '#37A0DA', null, null, 19),
  ('pentesterlab', 'PentesterLab', 'cyber', 'https://pentesterlab.com', 'initial', 'PL', '#1F2937', null, null, 20),
  ('portswigger', 'PortSwigger Web Security Academy', 'cyber', 'https://portswigger.net/web-security', 'react-icons', 'SiPortswigger', '#FF6633', null, null, 21),
  ('cyberdefenders', 'CyberDefenders', 'cyber', 'https://cyberdefenders.org', 'react-icons', 'SiCyberdefenders', '#0B3D91', null, null, 22),
  ('letsdefend', 'LetsDefend', 'cyber', 'https://letsdefend.io', 'initial', 'LD', '#1B998B', null, null, 23),
  ('root-me', 'Root-Me', 'cyber', 'https://www.root-me.org', 'react-icons', 'SiRootme', '#B71C1C', null, null, 24),
  ('ctftime', 'CTFtime', 'cyber', 'https://ctftime.org', 'initial', 'CTF', '#1B1B1B', null, null, 25),
  ('hackerone', 'HackerOne', 'bugbounty', 'https://hackerone.com', 'react-icons', 'SiHackerone', '#494649', null, null, 26),
  ('bugcrowd', 'Bugcrowd', 'bugbounty', 'https://www.bugcrowd.com', 'react-icons', 'SiBugcrowd', '#FF6E4A', null, null, 27),
  ('synack', 'Synack', 'bugbounty', 'https://www.synack.com', 'initial', 'SY', '#E4002B', null, null, 28)
on conflict (slug) do update set
  name = excluded.name,
  category = excluded.category,
  url = excluded.url,
  icon_kind = excluded.icon_kind,
  icon_ref = excluded.icon_ref,
  brand_color = excluded.brand_color,
  sync_adapter = excluded.sync_adapter,
  import_hint = excluded.import_hint,
  sort_order = excluded.sort_order;
