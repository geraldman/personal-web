import { unstable_cache } from "next/cache"; 

async function fetchGithubCommitRaw(){
    // 1. Get all your repos
    const repoRes = await fetch("https://api.github.com/users/geraldman/repos?per_page=100", {
        next: { revalidate: 86400 },
    });

    if(!repoRes.ok) return 0;
    const repos: { name: string }[] = await repoRes.json();

    // 2. Sum commits from each repo
    const commitCounts = await Promise.all(
    repos.map(async (repo): Promise<number> => {
        const r = await fetch(`https://api.github.com/repos/geraldman/${repo.name}/commits?per_page=1`,
            {next : { revalidate: 86400 }}
        );
        if(!r.ok) return 0;
        const link = r.headers.get("link");
        const match = link?.match(/page=(\d+)>; rel="last"/);
        return match ? parseInt(match[1]) : 1;
    })
    );

    const totalCommits: number = commitCounts.reduce((a, b) => a + b, 0);

    return totalCommits;
}

export const fetchGithubCommit = unstable_cache(
    fetchGithubCommitRaw,
    ["github-total-commits"],
    { revalidate: 86400, tags: ["github-commits"] }
);