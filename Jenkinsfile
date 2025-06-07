pipeline {
    agent any

    environment {
        IMAGE_NAME = 'tuhin200/three-tier-node-app'
        TAG = 'latest'
    }

    stages {
        stage('Clone Repository') {
            steps {
                git branch: 'main', url: 'https://github.com/tuhinmiazy73/Three-Tier-Node-App.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    sh "docker build -t ${env.IMAGE_NAME}:${env.TAG} ."
                }
            }
        }

        stage('Login to Docker Hub and Push') {
            steps {
                withCredentials([[$class: 'VaultUsernamePasswordCredentialBinding',
                                  credentialsId: 'docker-hub-vault-creds',
                                  usernameVariable: 'DOCKER_USER',
                                  passwordVariable: 'DOCKER_PASS']]) {
                    script {
                        sh '''
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                        docker push ${IMAGE_NAME}:${TAG}
                        docker logout
                        '''
                    }
                }
            }
        }
    }
}
