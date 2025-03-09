FROM ghcr.io/eclipse-theia/theia-ide/theia-ide:1.59.1

###### Customize Theia IDE image to add additional tools and configurations #############################

# Inspired by gitpod base image: https://github.com/gitpod-io/workspace-images/blob/main/base/Dockerfile

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

# custom Bash prompt
RUN curl -L https://raw.github.com/git/git/master/contrib/completion/git-prompt.sh > .bash_git && \
    echo "source ~/.bash_git;PS1='\[\033[01;32m\]\u\[\033[00m\] \[\033[01;34m\]\w\[\033[00m\]\$(__git_ps1 \" (%s)\") $ '" >> .bashrc && \
    echo "source ~/.bashrc" >> .bash_profile

COPY --chown=theia:theia .docker/default.gitconfig .gitconfig

###### END CUSTOMIZATION #################################################################################

###### FEASPACE SERVER ###################################################################################

COPY --chown=theia:theia .output /home/theia/feaspace
COPY --chown=theia:theia .docker/entrypoint.sh /home/theia/entrypoint.sh

ENV NITRO_PORT=3001
EXPOSE 3001

###### END FEASPACE SERVER ##############################################################################

# Launch the backend application via node
ENTRYPOINT [ "/home/theia/entrypoint.sh" ]

# Arguments passed to the application
CMD [ "/workspace", "--hostname=0.0.0.0" ]
