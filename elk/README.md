# Installation

./installation.sh

# Open Ports

9200 - Elastic Search
5601 - Kibana - may not be needed
80 - nginx - redirection to Kibana
10520 - TCP
10521 - UDP

# Operation

**start**

sudo service elasticsearch start
sudo service logstash start
sudo ./kibana.sh start 

**stop**

sudo service elasticsearch stop
sudo service logstash stop
sudo ./kibana.sh stop

**status**

sudo service elasticsearch status
sudo service logstash status
sudo ./kibana.sh status

# Logstash

`stdin` input and `stdout` output are for debugging only

## input

### TCP Input to Logstash


Listens on port 10520 for TCP from any IP address (can be restricted)

### UDP Input to Logstash


Listens on port 10521 for UDP from any IP address (can be restricted)

## filter

### json

parse message field into json

## output 

### elasticsearch

index `logstash-logstash-%{+YYYY.MM.dd}` set by date


#Test


*TCP input*

    node reconnecting_client.js <host>

type something and click ENTER, it will be transmitted to Logstash

*UDP input*

    node command_line_udp_client.js <host> <port>

type something and click ENTER, it will be transmitted to Logstash

*sending json*

To send JSON write as a string on command line:

    { "a" : "bbb", "c" : "v12"}

# Elastic Search Local Queries


Count all documents in all indexes

    curl http://localhost:9200/_count -d '{ "query" : { "match_all": {}  }   }'

Search all documents in all indexes

    curl http://localhost:9200/_search -d '{ "query" : { "match_all": {}  }   }'

For pretty-printing do:

curl http://localhost:9200/_search?pretty -d '{ "query" : { "match_all": {}  }   }'

# Kibana

Open your browser at:

    http://localhost:5601

For remote access open your browser at:

    http://<host name>

Access Restricted popup will appear. The credentials are:

* username: backkibadm 
* password: TWzxXmEfN2

# Lynx

Command-line browser. To open URL do:

    lynx url

# Limitations

1. Need to set ELK stack to start automatically on boot up.

## .NET Logger

Sends message to Logstash via TCP, with object encoded as JSON string.

Call `SendMessage` with all parameters as String. For missing values, pass `null`

