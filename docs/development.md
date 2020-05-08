# Development

This integration focuses on the [GitLab](https://about.gitlab.com/) and is using
[GitLab API](https://docs.gitlab.com/ee/api/) for interacting with the GitLab
platform. It can work with both SaaS (GitLab.com) and a self-hosted GitLab
version.

## Prerequisites

Depending on what type of environment you want to use this integration in, the
guide will slightly vary. The next section "Provider account setup" has 2 sets
of instructions based on the type.

## Provider account setup

### SaaS GitLab.com

To set up a GitLab account for development, please take the following steps:

1. Visit the [GitLab Sign in](https://gitlab.com/users/sign_in) and sign in/sign
   up using the method of your choice.

### Self-Hosted GitLab

To set up a GitLab account for development, please take the following steps:

1. Visit the [GitLab installation](https://about.gitlab.com/install/) section
   and install the software using your method of choice.
2. The very first time you visit GitLab (depending on where it is installed, if
   locally you can visit it by navigating to http://localhost/), you will be
   asked to set up the admin password.
3. After you enter the admin password, you can log in with username "**root**"
   and the password you set up.

## Authentication

Once you've created your account, you'll need to generate an API Key to access
the GitLab API.

1. First, click on your avatar (top-right) and select "Settings".
2. From the left side menu, select "Access Tokens".
3. Add a new personal access token by giving it a name, expiration (optional) as
   well as selecting the usage permissions based on your use case. Then click
   "Create person access token" below.
   ![User and API Key Rights](images/personal-access-tokens.png)
4. You'll see your newly generated API key at the top of the page underneath
   "Your New Personal Access Token" field. It's shown only once, so make sure to
   save it somewhere or you'll need to re-create it again later.
5. Copy the API Key, create a `.env` file at the root of this project, and set
   an `API_KEY` variable with the copied value.

```bash
PERSONAL_TOKEN="paste the api key here"
```

6. The final step is to also include the hostname in the `.evn` file. If you're
   using SaaS, the value you want to put inside is https://gitlab.com. However,
   if you're using a self-hosted approach, put the URL that points to it.

For example, if it's localhost, simply add it to the .env in this way.

```bash
PERSONAL_TOKEN="paste the api key here"
BASE_URL="e.g. https://gitlab.com (or your custom hostname http://localhost")
```

After following the above steps, you should now be able to start contributing to
this integration. The integration will pull in the `PERSONAL_TOKEN` and
`BASE_URL` variables from the `.env` file and use them when making requests.
