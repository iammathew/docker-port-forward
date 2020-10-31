FROM alpine:3.2

RUN apk add --update nginx && \
    rm -rf /var/cache/apk/*
RUN echo 'daemon off;' >> /etc/nginx/nginx.conf
CMD ["/usr/sbin/nginx"]