pipeline {
    agent none
    stages {
        stage('Agent Test Server') {
            agent { label 'test-server' }
    
            environment {
                DOCKER_IMAGE_NAME = "nodejs-api"
                DOCKER_IMAGE_TAG = "latest"
                GIT_CREDENTIALS = "gitlab-thanadon-k" 
            }
            
            stages {
                stage("Clone Repository From NodeJS-API") {
                    steps {
                        script {
                            withCredentials([usernamePassword(credentialsId: "${GIT_CREDENTIALS}", 
                                                            usernameVariable: "GIT_USERNAME", 
                                                            passwordVariable: "GIT_PASSWORD")]) {
                                if (fileExists('nodejs-api')) {
                                    dir('nodejs-api') {
                                        sh "git pull origin main"
                                    }
                                } else {
                                    sh "git clone https://${GIT_USERNAME}:${GIT_PASSWORD}@gitlab.com/sdp-g3/nodejs-api.git ./nodejs-api"
                                }
                            }
                        }
                    }
                }

                stage("Install Dependencies") {
                    steps {
                        dir('nodejs-api') {
                            script {
                                def jestInstalled = sh(script: "npm list jest --depth=0", returnStatus: true) == 0
                                def supertestInstalled = sh(script: "npm list supertest --depth=0", returnStatus: true) == 0

                                if (!jestInstalled || !supertestInstalled) {
                                    echo "Installing jest and supertest"
                                    sh "npm install --save-dev jest supertest"
                                } else {
                                    echo "jest and supertest already installed, skipping installation"
                                }
                            }
                        }
                    }
                }

                stage("Build Docker Image") {
                    steps {
                        script {
                            dir('nodejs-api') {
                                sh "docker build -t ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG} ."
                            }
                        }
                    }
                }

                stage("Run Docker Container") {
                    steps {
                        script {
                            sh "docker ps -a -q -f name=${DOCKER_IMAGE_NAME} | xargs -r docker rm -f"
                            sh "docker run -d --name ${DOCKER_IMAGE_NAME} -p 8080:3000 ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}"
                        }
                    }
                }

                stage("Clone Repository From Robot-Test") {
                    steps {
                        script {
                            withCredentials([usernamePassword(credentialsId: "${GIT_CREDENTIALS}", 
                                                            usernameVariable: "GIT_USERNAME", 
                                                            passwordVariable: "GIT_PASSWORD")]) {
                                if (fileExists('robot-test')) {
                                    dir('robot-test') {
                                        sh "git pull origin main"
                                    }
                                } else {
                                    sh "git clone https://${GIT_USERNAME}:${GIT_PASSWORD}@gitlab.com/sdp-g3/robot-test.git ./robot-test"
                                }
                            }
                        }
                    }
                }

                stage("Run Robot-Test") {
                    steps {
                        dir('robot-test') {
                            script {
                                sh '''
                                . "/home/thanadon-k/workspace/Test-Deploy/robot-test/venv/bin/activate"
                                robot test-api.robot
                                '''
                                sh "docker ps -q -f name=${DOCKER_IMAGE_NAME} | xargs -r docker stop"
                            }
                        }
                    }
                }

                stage('Push Docker Image') {
                    steps {
                        script {
                            withCredentials([usernamePassword(credentialsId: "${GIT_CREDENTIALS}", 
                                                            usernameVariable: "GIT_USERNAME", 
                                                            passwordVariable: "GIT_PASSWORD")]) {
                                sh "docker login -u ${GIT_USERNAME} -p ${GIT_PASSWORD} registry.gitlab.com"
                                sh "docker tag ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG} registry.gitlab.com/sdp-g3/nodejs-api:${DOCKER_IMAGE_TAG}"
                                sh "docker push registry.gitlab.com/sdp-g3/nodejs-api:${DOCKER_IMAGE_TAG}"
                            }
                        }
                    }
                }
            }
        }

        stage('Agent Pre-Prod Server') {
            agent { label 'pre-prod-server' }
            
            environment {
                DOCKER_IMAGE_NAME = "nodejs-api"
                DOCKER_IMAGE_TAG = "latest"
                GIT_CREDENTIALS = "gitlab-thanadon-k" 
            }
            
            stages {
                stage("Pull Docker Image") {
                    steps {
                        script {
                            withCredentials([usernamePassword(credentialsId: "${GIT_CREDENTIALS}", 
                                                            usernameVariable: "GIT_USERNAME", 
                                                            passwordVariable: "GIT_PASSWORD")]) {
                                sh "docker login -u ${GIT_USERNAME} -p ${GIT_PASSWORD} registry.gitlab.com"
                                sh "docker pull registry.gitlab.com/sdp-g3/nodejs-api:${DOCKER_IMAGE_TAG}"
                            }
                        }
                    }
                }

                stage("Run Docker Container") {
                    steps {
                        script {
                            sh "docker ps -a -q -f name=${DOCKER_IMAGE_NAME} | xargs -r docker rm -f"
                            sh "docker run -d --name ${DOCKER_IMAGE_NAME} -p 8080:3000 registry.gitlab.com/sdp-g3/nodejs-api:${DOCKER_IMAGE_TAG}"
                        }
                    }
                }
            }
        }
    }
}
