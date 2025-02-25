# DevSoc Subcommittee Recruitment: Platforms
Your task is to send a direct message to the matrix handle `@chino:oxn.sh` using the Matrix protocol. However, this message must be sent over a self hosted instance such as through the Conduwuit implementation or the slightly more complicated Synapse implementation.

For this to work your server must be federated, but you do not have to worry about specifics such as using your domain name as your handle (a subdomain will do!) or have other 'nice to have' features. Just a message will do!

**You should write about what you tried and your process in the answer box below.**

This task intentionally sounds challenging and contains language not frequently used in platforms as it refers to a specific protocol. The aim of this task is to research and make sense to some of the various terminology. If you don't manage to get this working we'll still want to hear about what you tried, what worked and what didn't work, etc, as knowledge isn't required, just the ability to try figure things out! Good luck!

---

> ANSWER BOX
```
My process for deployment of my matrix server was using the matrix-docker-ansible-deploy project as many people had reccommended me this in the past when I was dabbling in matrix server deployment. I SSH'd into my Oracle Cloud container and installed all necessary prerequisites to run ansible. I then followed the guide in their documentation to set up the configuration files with my domain information and desired traefik proxy setup. When running the setup, I had an error come up when the Postgres database was being set up but checking the logs I could see it was failing due to a missing package. I then looked up the error on the project GitHub issues page and saw other people had similar issues before installing the required package onto the server. Once that was setup, I first checked that the server was working locally over curl in the SSH terminal. 

Once this was done, I looked for instructions to properly expose the matrix server over a reverse proxy. Instructions were available in the documentation so I used that to set up the necessary configurations for the ansible controlled proxy to stop acting as a reverse proxy. I then looked at the example for the nginx reverse proxy config and copied over parts at a time into my SWAG reverse proxy (basically a repackaged nginx for use on docker) whilst also adapting the SSL and resolver configs to match how my reverse proxy is set up. I then added the DNS records to my domain (using Cloudflare DNS) and restarted the reverse proxy for the SSL certificates to refresh. 

I was now able to access the element web client from my subdomain however I still was left to federate the domain. Since the reverse proxy was already controlling the root domain, I simply added a couple lines to my main config to redirect any /.well-known requests to the matrix.raine.moe subdomain. I then generated the static files using the ansible playbook to complete the federation process. However, when I ran the matrix federation tester, I was getting connection refused errors when trying to connect to port 8448. To debug this, I first went back to SSH to test if the federation API was accessible internally - which it was. This led me to check my ports and I figured out that the port was blocked on the cloud provider firewall. Upon opening that port, it still was not working. I tried a bunch of things until I tried accessing the reverse proxy endpoint from the local machine (i.e 127.0.0.1:8448) which was giving me connection refused. That was when I finally realised I forgot to expose port 8448 on the docker. Once I did that the setup was complete. 

```
