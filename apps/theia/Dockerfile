FROM ghcr.io/eclipse-theia/theia-ide/theia-ide:1.59.1

###### Customize Theia IDE image to add additional tools and configurations #############################

# Inspired by gitpod base image: https://github.com/gitpod-io/workspace-images/blob/main/base/Dockerfile

LABEL org.opencontainers.image.source=https://github.com/feavy/workspace
LABEL org.opencontainers.image.description="Workspace Theia Docker Image"
LABEL org.opencontainers.image.licenses=MIT

USER root

RUN apt-get -y update && \
    apt-get install -y \
    curl \
    wget \
    zip \
    unzip \
    bash-completion \
    build-essential \
    ninja-build \
    clang \
    htop \
    iputils-ping \
    jq \
    less \
    locales \
    man-db \
    nano \
    ripgrep \
    software-properties-common \
    sudo \
    stow \
    time \
    emacs-nox \
    vim \
    multitail \
    lsof \
    ssl-cert \
    fish \
    zsh \
    rlwrap \
    && npm install -g zx \
    && locale-gen en_US.UTF-8

ENV LANG=en_US.UTF-8

# Install git LFS
RUN add-apt-repository -y ppa:git-core/ppa && \
    curl -s https://packagecloud.io/install/repositories/github/git-lfs/script.deb.sh | bash && \
    apt-get install -y git git-lfs && \
    add-apt-repository -r -y ppa:git-core/ppa && \
    apt-get clean

# Make theia user sudoer
RUN usermod -aG sudo theia && \
    sed -i.bkp -e "/Defaults\tuse_pty/d" -e "s/%sudo\s\+ALL=(ALL\(:ALL\)\?)\s\+ALL/%sudo ALL=NOPASSWD:ALL/g" /etc/sudoers

# Create workspace directory
RUN mkdir -p /workspace && \
    chown theia:theia /workspace

USER theia

ENV HOME=/home/theia
WORKDIR $HOME

# custom Bash prompt with git branch
RUN curl -L https://raw.github.com/git/git/master/contrib/completion/git-prompt.sh > .bash_git && \
    echo "source ~/.bash_git;PS1='\[\033[01;32m\]\u\[\033[00m\] \[\033[01;34m\]\w\[\033[00m\]\$(__git_ps1 \" (%s)\") $ '" >> .bashrc && \
    echo "source ~/.bashrc" >> .bash_profile

COPY --chown=theia:theia default.gitconfig .gitconfig

###### END CUSTOMIZATION #################################################################################

# Launch the backend application via node
ENTRYPOINT [ "node", "/home/theia/applications/browser/lib/backend/main.js" ]

# Arguments passed to the application
CMD [ "/workspace", "--hostname=0.0.0.0" ]
