# Workspace

**Goal:** Deploy remote development environment to Kubernetes in minutes.

## Roadmap

- [x] Workspace specification file.
- [ ] Create Kubernetes namespace, serviceaccount, deployments, services, configmaps, secrets, ingress.
- [ ] Create web server to handle routing and authentication.
  - [ ] Requires Firebase serviceAccountKey.json for authentication.
  - [ ] Authentication with GitHub.
  - [ ] Home page listing deployed services and their secrets.
  - [ ] Email whitelist.
- [ ] Deploy Docker image featuring Theia IDE & custom web server.
- [ ] Mount repositories to workspace and Theia pods.
    - [ ] Clone with SSH key.
- [ ] Include template from GitHub and arbitrary URL.
- [ ] Create a Theia IDE extension to enable live collaboration client/server mode.
