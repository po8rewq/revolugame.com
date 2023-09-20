## Install

```cmd
brew install hugo
```

To run the website locally:

```cmd
hugo server
```

To build everything before deployment:

```cmd
hugo
```

For the theme: [Stack](https://stack.jimmycai.com/).

In order to update the theme, just go to the [repo](https://github.com/CaiJimmy/hugo-theme-stack/releases/latest) and download the latest version.

More doc [here](https://gohugo.io/).

## Deploy

There's a github action that build the hugo site and deploy it to the sftp server.

Here's the [doc](https://github.com/marketplace/actions/sftp-deploy).