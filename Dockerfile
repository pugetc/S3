FROM node:6-slim
MAINTAINER Giorgio Regni <gr@scality.com>

WORKDIR /usr/src/app

# Keep the .git directory in order to properly report version
COPY . /usr/src/app

RUN apt-get update \
    && apt-get install -y jq python git build-essential --no-install-recommends \
    && npm install --production \
    && apt-get autoremove --purge -y python git build-essential \
    && rm -rf /var/lib/apt/lists/* \
    && npm cache clear \
    && rm -rf ~/.node-gyp \
    && rm -rf /tmp/npm-* \
    && groupadd -r -g 1001 scality \
    && useradd -u 1001 -g 1001 -d /usr/src/app -r scality \
    && chown -R scality:scality /usr/src/app
    
VOLUME ["/usr/src/app/localData","/usr/src/app/localMetadata"]

USER scality
ENTRYPOINT ["/usr/src/app/docker-entrypoint.sh"]
CMD [ "npm", "start" ]

EXPOSE 8000
