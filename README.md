# Jenkins-API

## Overview

A Node.js API using Express for basic arithmetic operations, tested with Jest and Supertest.

## Prerequisites

- Node.js (v14+ recommended)
- npm

## Setup

### Clone the Repository

```sh
git clone https://gitlab.com/sdp-g3/Jenkins-API.git
cd Jenkins-API
```

### Install Dependencies

```sh
npm install
npm install --save-dev jest supertest
```

### Running the Server

```sh
npm start
```

### Running Tests

```sh
npm test -- --detectOpenHandles

```

## Resolving NPM Installation Issues on Jenkins-Slave (Ubuntu)
#### If you encounter issues with NPM on Ubuntu, adjust your network settings:
## DNS Configuration
1. #### Edit /etc/resolv.conf:

```sh
sudo nano /etc/resolv.conf
```

1. #### Add:

```sh
nameserver 8.8.8.8
nameserver 8.8.4.4
```

1. #### Save and exit (Ctrl + X, Y, Enter).

## Disabling IPv6

1. #### Edit /etc/sysctl.conf:

```sh
sudo nano /etc/sysctl.conf
```

1. #### Add:

```sh
net.ipv6.conf.all.disable_ipv6 = 1
net.ipv6.conf.default.disable_ipv6 = 1
net.ipv6.conf.lo.disable_ipv6 = 1
```

1. #### Save and exit (Ctrl + X, Y, Enter).


1. #### Apply changes:

```sh
sudo sysctl -p
```


