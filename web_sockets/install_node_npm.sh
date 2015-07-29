echo 'export PATH=/local/bin:$PATH' >> ~/.bashrc
. ~/.bashrc
mkdir node-latest
cd node-latest
curl http://nodejs.org/dist/node-latest.tar.gz | tar xz --strip-components=1
./configure 
make install # ok, fine, this step probably takes more than 30 seconds...
sudo ln -s /usr/local/bin/node /usr/bin/node
