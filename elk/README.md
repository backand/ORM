Installation
============
./installation.sh

Open Ports
==========
9200 - Elastic Search
5601 - Kibana

Operation
=========
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

Elastic Search Local Queries
============================

Count all documents in all indexes

curl http://localhost:9200/_count -d '{ "query" : { "match_all": {}  }   }'

Search all documents in all indexes

curl http://localhost:9200/_search -d '{ "query" : { "match_all": {}  }   }'

Lynx
====
Command-line browser. To open URL do:

    lynx url

Kibana
======
Open your browser at:

    http://localhost:5601

Limitations
===========
Need to set ELK stack to start automatically on boot up.