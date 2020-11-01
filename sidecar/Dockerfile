FROM alpine:3.2

RUN apk add --update socat && \
    rm -rf /var/cache/apk/*

ENTRYPOINT ["tail", "-f", "/dev/null"]