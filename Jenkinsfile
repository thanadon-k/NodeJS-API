pipeline {
    agent none

    environment {
        DOCKER_IMAGE_NAME = "nodejs-api"
        DOCKER_IMAGE_TAG = "latest"
        GIT_CREDENTIALS = "gitlab-thanadon-k" 
        GITLAB_PROJECT = 'sdp-g3'
        GITLAB_REPO_NODEJS = 'nodejs-api'
        GITLAB_REPO_ROBOT_TEST = 'robot-test'
    }

    stages {
        stage('Agent Test Server') {
            agent { label 'test-server' }
            
            stages {
                stage("Clone Repository From NodeJS-API") {
                    steps {
                        script {
                            withCredentials([usernamePassword(credentialsId: "${GIT_CREDENTIALS}", 
                                                            usernameVariable: "GIT_USERNAME", 
                                                            passwordVariable: "GIT_PASSWORD")]) {
                                if (fileExists("${GITLAB_REPO_NODEJS}")) {
                                    dir("${GITLAB_REPO_NODEJS}") {
                                        sh "git pull origin main"
                                    }
                                } else {
                                    sh "git clone https://${GIT_USERNAME}:${GIT_PASSWORD}@gitlab.com/${GITLAB_PROJECT}/${GITLAB_REPO_NODEJS}.git"
                                }
                            }
                        }
                    }
                }

                stage("Install Dependencies") {
                    steps {
                        dir("${GITLAB_REPO_NODEJS}") {
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

                stage("Run Unittest") {
                    steps {
                        dir("${GITLAB_REPO_NODEJS}") {
                            script {
                                sh "npm test -- --detectOpenHandles"
                            }
                        }
                    }
                }

                stage("Build Docker Image") {
                    steps {
                        script {
                            dir("${GITLAB_REPO_NODEJS}") {
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
                                if (fileExists("${GITLAB_REPO_ROBOT_TEST}")) {
                                    dir("${GITLAB_REPO_ROBOT_TEST}") {
                                        sh "git pull origin main"
                                    }
                                } else {
                                    sh "git clone https://${GIT_USERNAME}:${GIT_PASSWORD}@gitlab.com/${GITLAB_PROJECT}/${GITLAB_REPO_ROBOT_TEST}.git"
                                }
                            }
                        }
                    }
                }

                stage("Run Robot-Test") {
                    steps {
                        dir("${GITLAB_REPO_ROBOT_TEST}") {
                            script {
                                sh """
                                . "/home/thanadon-k/workspace/Test-Deploy/${GITLAB_REPO_ROBOT_TEST}/venv/bin/activate"
                                robot test-api.robot
                                """
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
                                sh "docker tag ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG} registry.gitlab.com/${GITLAB_PROJECT}/${GITLAB_REPO_NODEJS}:${DOCKER_IMAGE_TAG}"
                                sh "docker push registry.gitlab.com/${GITLAB_PROJECT}/${GITLAB_REPO_NODEJS}:${DOCKER_IMAGE_TAG}"
                            }
                        }
                    }
                }
            }
        }

        stage('Agent Pre-Prod Server') {
            agent { label 'pre-prod-server' }
            
            stages {
                stage("Pull Docker Image") {
                    steps {
                        script {
                            withCredentials([usernamePassword(credentialsId: "${GIT_CREDENTIALS}", 
                                                            usernameVariable: "GIT_USERNAME", 
                                                            passwordVariable: "GIT_PASSWORD")]) {
                                sh "docker login -u ${GIT_USERNAME} -p ${GIT_PASSWORD} registry.gitlab.com"
                                sh "docker pull registry.gitlab.com/${GITLAB_PROJECT}/${GITLAB_REPO_NODEJS}:${DOCKER_IMAGE_TAG}"
                            }
                        }
                    }
                }

                stage("Run Docker Container") {
                    steps {
                        script {
                            sh "docker ps -a -q -f name=${DOCKER_IMAGE_NAME} | xargs -r docker rm -f"
                            sh "docker run -d --name ${DOCKER_IMAGE_NAME} -p 8080:3000 registry.gitlab.com/${GITLAB_PROJECT}/${GITLAB_REPO_NODEJS}:${DOCKER_IMAGE_TAG}"
                        }
                    }
                }
            }
        }
    }
}
