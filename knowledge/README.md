# HackTricks

_Hacktricks logos & motion design by_ [_@ppieranacho_](https://www.instagram.com/ppieranacho/)_._

### Run HackTricks Locally

```bash
# Download latest version of hacktricks
git clone https://github.com/HackTricks-wiki/hacktricks

# Select the language you want to use
export LANG="master" # Leave master for english
# "af" for Afrikaans
# "de" for German
# "el" for Greek
# "es" for Spanish
# "fr" for French
# "hi" for HindiP
# "it" for Italian
# "ja" for Japanese
# "ko" for Korean
# "pl" for Polish
# "pt" for Portuguese
# "sr" for Serbian
# "sw" for Swahili
# "tr" for Turkish
# "uk" for Ukrainian
# "zh" for Chinese

# Run the docker container indicating the path to the hacktricks folder
docker run -d --rm --platform linux/amd64 -p 3337:3000 --name hacktricks -v $(pwd)/hacktricks:/app ghcr.io/hacktricks-wiki/hacktricks-cloud/translator-image bash -c "mkdir -p ~/.ssh && ssh-keyscan -H github.com >> ~/.ssh/known_hosts && cd /app && git config --global --add safe.directory /app && git checkout $LANG && git pull && MDBOOK_PREPROCESSOR__HACKTRICKS__ENV=dev mdbook serve --hostname 0.0.0.0"
```

Your local copy of HackTricks will be **available at [http://localhost:3337](http://localhost:3337)** after <5 minutes (it needs to build the book, be patient).

## Corporate Sponsors

### [STM Cyber](https://www.stmcyber.com)

[**STM Cyber**](https://www.stmcyber.com) is a great cybersecurity company whose slogan is **HACK THE UNHACKABLE**. They perform their own research and develop their own hacking tools to **offer several valuable cybersecurity services** like pentesting, Red teams and training.

You can check their **blog** in [**https://blog.stmcyber.com**](https://blog.stmcyber.com)

**STM Cyber** also support cybersecurity open source projects like HackTricks :)

---

### [Intigriti](https://www.intigriti.com)

**Intigriti** is the **Europe's #1** ethical hacking and **bug bounty platform.**

**Bug bounty tip**: **sign up** for **Intigriti**, a premium **bug bounty platform created by hackers, for hackers**! Join us at [**https://go.intigriti.com/hacktricks**](https://go.intigriti.com/hacktricks) today, and start earning bounties up to **$100,000**!

> Related: [https://go.intigriti.com/hacktricks](https://go.intigriti.com/hacktricks)

---

### [HACKENPROOF](https://bit.ly/3xrrDrL)

Join [**HackenProof Discord**](https://discord.com/invite/N3FrSbmwdy) server to communicate with experienced hackers and bug bounty hunters!

- **Hacking Insights:** Engage with content that delves into the thrill and challenges of hacking
- **Real-Time Hack News:** Keep up-to-date with fast-paced hacking world through real-time news and insights
- **Latest Announcements:** Stay informed with the newest bug bounties launching and crucial platform updates

**Join us on** [**Discord**](https://discord.com/invite/N3FrSbmwdy) and start collaborating with top hackers today!

---

### [Modern Security – AI & Application Security Training Platform](https://modernsecurity.io/)

Modern Security delivers **practical AI Security training** with an **engineering-first, hands-on lab approach**. Our courses are built for security engineers, AppSec professionals, and developers who want to **build, break, and secure real AI/LLM-powered applications**.

The **AI Security Certification** focuses on real-world skills, including:
- Securing LLM and AI-powered applications
- Threat modeling for AI systems
- Embeddings, vector databases, and RAG security
- LLM attacks, abuse scenarios, and practical defenses
- Secure design patterns and deployment considerations

All courses are **on-demand**, **lab-driven**, and designed around **real-world security tradeoffs**, not just theory.

👉 More details on the AI Security course:
https://www.modernsecurity.io/courses/ai-security-certification

> Related: [https://modernsecurity.io/](https://modernsecurity.io/)

---

### [SerpApi](https://serpapi.com/)

**SerpApi** offers fast and easy real-time APIs to **access search engine results**. They scrape search engines, handle proxies, solve captchas, and parse all rich structured data for you.

A subscription to one of SerpApi’s plans includes access to over 50 different APIs for scraping different search engines, including Google, Bing, Baidu, Yahoo, Yandex, and more.\
Unlike other providers, **SerpApi doesn’t just scrape organic results**. SerpApi responses consistently include all ads, inline images and videos, knowledge graphs, and other elements and features present in the search results.

Current SerpApi customers include **Apple, Shopify, and GrubHub**.\
For more information check out their [**blog**](https://serpapi.com/blog/)**,** or try an example in their [**playground**](https://serpapi.com/playground)**.**\
You can **create a free account** [**here**](https://serpapi.com/users/sign_up)**.**

---

### [8kSec Academy – In-Depth Mobile Security Courses](https://academy.8ksec.io/)

Learn the technologies and skills required to perform vulnerability research, penetration testing, and reverse engineering to protect mobile applications and devices. **Master iOS and Android security** through our on-demand courses and **get certified**:

> Related: [https://academy.8ksec.io/](https://academy.8ksec.io/)

---

### [NaxusAI – AI Powered Security Scanner](https://academy.8ksec.io/)

**NaxusAI** is an AI-powered security platform to find exploitable vulnerabilities before attackers do.

**Code security tip**: sign up for NaxusAI, a smart vulnerability monitoring platform built for developers and security teams! Join us today and start using AI for **detecting, validating, and fixing real security risks before they reach production**!

> Related: [https://naxusai.com](https://naxusai.com)

---

### [WebSec](https://websec.net/)

[**WebSec**](https://websec.net) is a professional cybersecurity company based in **Amsterdam** which helps **protecting** businesses **all over the world** against the latest cybersecurity threats by providing **offensive-security services** with a **modern** approach.

WebSec is an intenational security company with offices in Amsterdam and Wyoming. They offer **all-in-one security services** which means they do it all; Pentesting, **Security** Audits, Awareness Trainings, Phishing Campagnes, Code Review, Exploit Development, Security Experts Outsourcing and much more.

Another cool thing about WebSec is that unlike the industry average WebSec is **very confident in their skills**, to such an extent that they **guarantee the best quality results**, it states on their website "**If we can't hack it, You don't pay it!**". For more info take a look at their [**website**](https://websec.net/en/) and [**blog**](https://websec.net/blog/)!

In addition to the above WebSec is also a **committed supporter of HackTricks.**

> Related: [https://www.youtube.com/watch?v=Zq2JycGDCPM](https://www.youtube.com/watch?v=Zq2JycGDCPM)

---

### [CyberHelmets](https://cyberhelmets.com/courses/?ref=hacktricks)

**Built for the field. Built around you.**\
[**Cyber Helmets**](https://cyberhelmets.com/?ref=hacktricks) develops and delivers effective cybersecurity training built and led by
industry experts. Their programs go beyond theory to equip teams with deep
understanding and actionable skills, using custom environments that reflect real-world
threats. For custom training inquiries, reach out to us [**here**](https://cyberhelmets.com/tailor-made-training/?ref=hacktricks).

**What sets their training apart:**
* Custom-built content and labs
* Backed by top-tier tools and platforms
* Designed and taught by practitioners

> Related: [https://cyberhelmets.com/courses/?ref=hacktricks](https://cyberhelmets.com/courses/?ref=hacktricks)

---

### [Last Tower Solutions](https://www.lasttowersolutions.com/)

Last Tower Solutions delivers specialized cybersecurity services for **Education** and **FinTech**
institutions, with a focus on **penetration testing, cloud security assessments**, and
**compliance readiness** (SOC 2, PCI-DSS, NIST). Our team includes **OSCP and CISSP
certified professionals**, bringing deep technical expertise and industry-standard insight to
every engagement.

We go beyond automated scans with **manual, intelligence-driven testing** tailored to
high-stakes environments. From securing student records to protecting financial transactions,
we help organizations defend what matters most.

_“A quality defense requires knowing the offense, we provide security through understanding.”_

Stay informed and up to date with the latest in cybersecurity by visiting our [**blog**](https://www.lasttowersolutions.com/blog).

> Related: [https://www.lasttowersolutions.com/](https://www.lasttowersolutions.com/)

---

### [K8Studio - The Smarter GUI to Manage Kubernetes.](https://k8studio.io/)

K8Studio IDE empowers DevOps, DevSecOps, and developers to manage, monitor, and secure Kubernetes clusters efficiently. Leverage our AI-driven insights, advanced security framework, and intuitive CloudMaps GUI to visualize your clusters, understand their state, and act with confidence.

Moreover, K8Studio is **compatible with all major kubernetes distributions** (AWS, GCP, Azure, DO, Rancher, K3s, Openshift and more).

> Related: [https://k8studio.io/](https://k8studio.io/)

---

## License & Disclaimer

Check them in:

> Related: [welcome/hacktricks-values-and-faq.md](welcome/hacktricks-values-and-faq.md)

## Github Stats
