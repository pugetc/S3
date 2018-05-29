FROM node:6-alpine
MAINTAINER Giorgio Regni <gr@scality.com>

RUN echo -e '#!/bin/sh\napk add --update "$@" && rm -rf /var/cache/apk/*' > /usr/bin/apk_add \
    && chmod +x /usr/bin/apk_add

ADD ./package.json ./package-lock.json /usr/src/app/

WORKDIR /usr/src/app

RUN apk_add jq bash\
    && apk_add --virtual build-deps \
       python \
       build-base \
       git \
    && npm install --production \
    && apk del build-deps \
    && npm cache clear \
    && rm -rf ~/.node-gyp \
    && rm -rf /tmp/npm-*

ADD . /usr/src/app

VOLUME ["/usr/src/app/localData","/usr/src/app/localMetadata"]

ENTRYPOINT ["/usr/src/app/docker-entrypoint.sh"]
CMD [ "npm", "start" ]

EXPOSE 8000
