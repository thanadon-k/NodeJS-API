pipeline {
    agent { label 'test-server' }
    
    environment {
        DOCKER_IMAGE_NAME = "node-api"
        DOCKER_IMAGE_TAG = "latest"
        GIT_CREDENTIALS = "gitlab-jenkins" 
    }
    
    stages {
        stage("Clone Repository From Jenkins-API") {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: "${GIT_CREDENTIALS}", 
                                                      usernameVariable: "GIT_USERNAME", 
                                                      passwordVariable: "GIT_PASSWORD")]) {
                        dir('Jenkins-API') {
                            if (fileExists('.git')) {
                                sh "git pull origin master"
                            } else {
                                sh "git clone https://${GIT_USERNAME}:${GIT_PASSWORD}@gitlab.com/sdp-g3/Jenkins-API.git ."
                            }
                        }
                    }
                }
            }
        }

        stage("Install Dependencies") {
            steps {
                dir('Jenkins-API') {
                    script {
                        sh "npm install --save-dev jest supertest"
                    }
                }
            }
        }

        stage("Run UnitTest") {
            steps {
                dir('Jenkins-API') {
                    script {
                        sh "npm test"
                    }
                }
            }
        }

        stage("Build Docker Image") {
            steps {
                script {
                    dir('Jenkins-API') {
                        sh "docker build -t ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG} ."
                    }
                }
            }
        }

        stage("Run Docker Container") {
            steps {
                script {
                    sh "docker ps -a -q -f name=${DOCKER_IMAGE_NAME} | xargs -r docker rm"
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
                        dir('robot-test') {
                            if (fileExists('.git')) {
                                sh "git pull origin main"
                            } else {
                                sh "git clone https://${GIT_USERNAME}:${GIT_PASSWORD}@gitlab.com/sdp-g3/robot-test.git ."
                            }
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
                        . /home/thanadon-k/workspace/Build\\ Docker\\ Images/robot-test/venv/bin/activate
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
                    sh "docker login -u ${GIT_USERNAME} -p ${GIT_PASSWORD} registry.gitlab.com"
                    sh "docker tag ${DOCKER_IMAGE_NAME} registry.gitlab.com/sdp-g3/jenkins-api"
                    sh "docker push registry.gitlab.com/sdp-g3/jenkins-api"
                }
            }
        }
    }

    post {
        always {
            sh 'docker system prune -af'
        }
    }

    
}
