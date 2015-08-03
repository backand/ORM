#!/bin/bash

# set repo for elastic search
sudo rpm --import http://packages.elasticsearch.org/GPG-KEY-elasticsearch
sudo cp elasticsearch.repo /etc/yum.repos.d/elasticsearch.repo

# install elastic search
sudo yum -y install elasticsearch-1.4.4

# set elastic search configuration
sudo cp elasticsearch.yml /etc/elasticsearch

# start elastic search as service
sudo service elasticsearch start

# set repo for logstash
sudo cp logstash.repo /etc/yum.repos.d/logstash.repo

# install logstash
sudo yum -y install logstash

# set logstash configuration
sudo cp logstash.conf /etc/logstash/conf.d

# start logstash as service
sudo service logstash start

# download kibana
wget https://download.elasticsearch.org/kibana/kibana/kibana-4.0.3-linux-x64.tar.gz

# extract file
tar xvf kibana-*.tar.gz

# move kibana to a proper location
sudo mkdir -p /opt/kibana
sudo cp -R ~/kibana-4*/* /opt/kibana/

# set kibana configuration
sudo cp kibana.yml /opt/kibana/config

# start kibana as service
sudo ./kibana.sh start 

# install lynx command-line browser
sudo yum -y install lynx

# add repo for nginx
sudo yum -y install epel-release

# install nginx
sudo yum -y install nginx httpd-tools

# set nginx configuration
sudo cp nginx.conf /etc/nginx
sudo cp kibana.conf /etc/nginx/conf.d

# create kibana password
sudo htpasswd -bc /etc/nginx/htpasswd.users backkibadm TWzxXmEfN2

# start nginx
sudo service nginx start

