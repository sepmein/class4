###### exec grunt && sync it with amazon s3 bucket

#! /bin/bash

grunt --force
cd dist
scp -r . root@128.199.224.113:/usr/share/nginx/html/kokiya/4