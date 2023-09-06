const { Octokit } = require("@octokit/core");
const octokit = new Octokit({
        auth:process.env.TOKEN
    }
);

class UserService{


    static countCommitsAndStarsAndTraffic = async (data) => {
        const { term, date } = data;
        const repos = {data:[], stats:{}}
        let page = 1;
        const per_page = 20;

        while (true) {
            if (repos.data.length >= 100 || page * per_page > 900)
                break;
            try{
                const searchResult = await octokit.request('GET /search/repositories', {
                    q: `${term} in:readme`,
                    per_page: per_page,
                    page: page
                });
                const repositories = searchResult.data.items;

                if (repositories.length === 0) {
                    break;
                }

                // CONCURRENT REQUEST EXECUTION
                const promises = repositories.map(async (repository) => {
                    const { owner, name } = repository;

                    try{
                        const repoInfo = await octokit.request('GET /repos/{owner}/{repo}', {
                            owner: owner.login,
                            repo: name,
                        });

                        return {
                            Repository: `${owner.login}/${name}`,
                            Page: `${repoInfo.data.html_url}`,
                            Created: `${repoInfo.data.created_at}`,
                            Stars: `${repoInfo.data.stargazers_count}`,
                            Forks: `${repoInfo.data.forks}`,
                            Subscribers: `${repoInfo.data.subscribers_count}`,
                            Network_count: `${repoInfo.data.network_count}`,
                        };
                    }catch (error){
                        console.log(error)
                        return `${error.status} : ${error.data.message}`;
                    }

                });

                const results = await Promise.all(promises);
                const tmp = results.filter((elem)=>{
                    return new Date(elem.Created) > new Date(date);
                })
                repos.data.push(...tmp);
                console.log(repos.data.length)
                page++;
            }catch (error){
                console.log(error);
                return `${error.status} : ${error.response.data.message}`;
            }

        }

        const mean_stars = repos.data.map(elem=>elem.Stars).reduce((a,b)=>a+parseInt(b),0)/repos.data.length;
        const mean_forks = repos.data.map(elem=>elem.Forks).reduce((a,b)=>a+parseInt(b),0)/repos.data.length;
        const mean_subs = repos.data.map(elem=>elem.Subscribers).reduce((a,b)=>a+parseInt(b),0)/repos.data.length;
        const mean_network = repos.data.map(elem=>elem.Network_count).reduce((a,b)=>a+parseInt(b),0)/repos.data.length;

        repos.data.sort((a, b) => {
            if (parseInt(a.Stars) !== parseInt(b.Stars)) {
                return parseInt(b.Stars) - parseInt(a.Stars);
            } else if (parseInt(a.Forks) !== parseInt(b.Forks)) {
                return parseInt(b.Forks) - parseInt(a.Forks);
            } else if (parseInt(a.Subscribers) !== parseInt(b.Subscribers)) {
                return parseInt(b.Subscribers) - parseInt(a.Subscribers);
            } else {
                return parseInt(b.Network_count) - parseInt(a.Network_count);
            }
        });

        repos.stats = {Count: repos.data.length, Mean_Stars: mean_stars, Mean_Forks:mean_forks, Mean_Subs: mean_subs, Mean_Network: mean_network}
        return repos;
    }

}

module.exports = {UserService}