-- Wave A'.2 -- the nine system kinds. Spec: docs/planning/RECORD-MODEL.md §6.
--
-- Every tracker Gerald asked for is a row here, not a table. A tenth kind (reading log, home-lab
-- inventory, cert tracker) is another row -- no migration, no frontend code.
--
-- `public` in capabilities for ctf, skill, resource and blog_post ONLY (decision 6). The LFS
-- kinds and competition deliberately have none: the raw build log is private source material and
-- the public artifact is a blog_post that links back to it with rel='source'. This is not an
-- oversight -- do not "fix" it.
--
-- Re-runnable: conflicts update the definition but never touch is_system or existing records.

insert into record_kinds
  (slug, name, plural_name, icon, color, statuses, default_status, capabilities, field_schema, is_system, sort_order)
values
  (
    'ctf', 'CTF Challenge', 'CTF Challenges', 'flag', 'accent',
    array['solved', 'in_progress', 'stuck', 'abandoned'], 'in_progress',
    array['dates', 'time', 'platform', 'rank:difficulty', 'tags', 'writeup', 'analysis',
          'public', 'external', 'body:markdown', 'links:skill', 'links:competition'],
    $json$[
      {"key":"discipline","label":"Discipline","type":"select","required":true,
       "options":["swe","cyber"],
       "help":"Top-level split. NOT the CTF category -- these are different axes."},
      {"key":"ctf_category","label":"Category","type":"select",
       "options":["pwn","web","crypto","forensics","reversing","ai","osint","hardware","ppc","misc"],
       "help":"CTF taxonomy. ai covers prompt injection and model attacks."},
      {"key":"tools_used","label":"Tools used","type":"tags",
       "help":"pwntools, ghidra, burp, ..."}
    ]$json$::jsonb,
    true, 10
  ),
  (
    'lfs_build', 'LFS Build', 'LFS Builds', 'layers', 'accent',
    array['planning', 'in_progress', 'complete', 'abandoned'], 'planning',
    array['dates', 'children:lfs_checkpoint'],
    $json$[
      {"key":"book_version","label":"Book version","type":"text","help":"e.g. LFS 12.2 systemd"},
      {"key":"target_arch","label":"Target arch","type":"text","help":"x86_64, aarch64"},
      {"key":"host_distro","label":"Host distro","type":"text"}
    ]$json$::jsonb,
    true, 20
  ),
  (
    'lfs_checkpoint', 'Build Checkpoint', 'Build Checkpoints', 'terminal', 'accent',
    array['pending', 'in_progress', 'done', 'blocked'], 'pending',
    array['dates', 'time', 'tags', 'analysis', 'children:lfs_issue', 'body:markdown', 'assisted'],
    $json$[
      {"key":"chapter","label":"Chapter","type":"text","help":"e.g. 5, 8.3"},
      {"key":"stage","label":"Stage","type":"select",
       "options":["toolchain","temp-tools","chroot","basic-system","config","kernel","boot","blfs"]},
      {"key":"commands","label":"Commands run","type":"code",
       "help":"What was actually run, not what the book says to run."},
      {"key":"config_choices","label":"Config choices","type":"keyvalue",
       "help":"Kernel flags, ./configure switches and why."},
      {"key":"package_versions","label":"Package versions","type":"keyvalue"},
      {"key":"security_notes","label":"Security notes","type":"markdown",
       "help":"Attack surface, privilege boundaries, what this step exposes. This is the column that makes the log worth publishing from."}
    ]$json$::jsonb,
    true, 21
  ),
  (
    'lfs_issue', 'Build Issue', 'Build Issues', 'bug', 'accent',
    array['open', 'resolved', 'workaround', 'abandoned'], 'open',
    array['time', 'body:markdown', 'assisted', 'links:skill'],
    $json$[
      {"key":"symptom","label":"Symptom","type":"code","required":true,
       "help":"The error output, verbatim."},
      {"key":"root_cause","label":"Root cause","type":"markdown"},
      {"key":"resolution","label":"Resolution","type":"markdown"},
      {"key":"time_lost_minutes","label":"Time lost","type":"number","private":true,
       "help":"Feeds the lfs_debug bucket -- the number that answers where LFS time actually went."},
      {"key":"references","label":"References","type":"tags","help":"URLs, mailing list threads."}
    ]$json$::jsonb,
    true, 22
  ),
  (
    'skill', 'Skill', 'Skills', 'brain', 'accent',
    array['not_started', 'learning', 'comfortable', 'strong'], 'not_started',
    array['rank:confidence', 'tags', 'public', 'body:markdown', 'links:resource'],
    $json$[
      {"key":"area","label":"Area","type":"text",
       "help":"binary-exploitation, web, crypto, linux-internals, ai-security, forensics, netsec"},
      {"key":"last_practiced_override","label":"Last practiced (manual)","type":"date","private":true,
       "help":"Only for practice that left no record. The displayed date is derived -- see RECORD-MODEL.md."}
    ]$json$::jsonb,
    true, 30
  ),
  (
    'competition', 'Competition', 'Competitions', 'trophy', 'accent',
    array['upcoming', 'registered', 'in_progress', 'complete', 'skipped'], 'upcoming',
    array['dates', 'platform', 'body:markdown', 'links:skill'],
    $json$[
      {"key":"format","label":"Format","type":"select",
       "options":["jeopardy","attack-defense","koth","mixed"]},
      {"key":"team_name","label":"Team","type":"text"},
      {"key":"is_solo","label":"Solo","type":"bool"},
      {"key":"placement","label":"Placement","type":"number"},
      {"key":"total_teams","label":"Total teams","type":"number"},
      {"key":"points","label":"Points","type":"number"},
      {"key":"retrospective","label":"Retrospective","type":"markdown","private":true,
       "help":"What tripped you up, what you needed but did not have. Never leaves the dashboard."}
    ]$json$::jsonb,
    true, 40
  ),
  (
    'blog_post', 'Blog Post', 'Blog Posts', 'pen', 'accent',
    array['idea', 'outlined', 'drafting', 'review', 'published', 'abandoned'], 'idea',
    array['dates', 'time', 'tags', 'public', 'body:markdown', 'links:source'],
    $json$[
      {"key":"mdx_path","label":"MDX path","type":"text",
       "help":"Repo path of the body. The body stays in the repo (MASTER-PLAN §1); only metadata lives here."},
      {"key":"target_publish_on","label":"Target publish date","type":"date"}
    ]$json$::jsonb,
    true, 50
  ),
  (
    'resource', 'Resource', 'Resources', 'bookmark', 'accent',
    array['to_try', 'using', 'archived'], 'to_try',
    array['rank:rating', 'tags', 'public', 'body:markdown'],
    $json$[
      {"key":"kind","label":"Kind","type":"select",
       "options":["tool","book","course","writeup","paper","cheatsheet","video","site"]},
      {"key":"category","label":"Category","type":"select",
       "options":["recon","pwn","web","ai-security","osint","forensics","crypto","misc"]}
    ]$json$::jsonb,
    true, 60
  ),
  (
    'review', 'Review', 'Reviews', 'calendar', 'accent',
    array['draft', 'final'], 'draft',
    array['dates', 'analysis', 'prefill'],
    $json$[
      {"key":"period","label":"Period","type":"select","required":true,
       "options":["weekly","monthly"]},
      {"key":"window_start","label":"Window start","type":"date","required":true},
      {"key":"window_end","label":"Window end","type":"date","required":true},
      {"key":"planned","label":"Planned","type":"markdown"},
      {"key":"done","label":"Done","type":"markdown"},
      {"key":"adjustments","label":"Adjustments","type":"markdown"}
    ]$json$::jsonb,
    true, 70
  )
on conflict (owner_id, slug) do update set
  name = excluded.name,
  plural_name = excluded.plural_name,
  icon = excluded.icon,
  color = excluded.color,
  statuses = excluded.statuses,
  default_status = excluded.default_status,
  capabilities = excluded.capabilities,
  field_schema = excluded.field_schema,
  sort_order = excluded.sort_order;
