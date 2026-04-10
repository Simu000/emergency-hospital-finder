pipeline {
    agent any

    environment {
        
        DOCKER_IMAGE = 'simu2006/hospital-finder'
        EC2_IP = 'your-ec2-public-ip'
        EC2_USER = 'ubuntu' 
        APP_NAME = 'hospital-finder'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                echo " Code pulled from GitHub"
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci || npm install'
                echo " Dependencies installed"
            }
        }

        stage('Build Frontend') {
            steps {
                sh 'npm run build'
                echo "Frontend built"
            }
        }

        stage('Run Tests') {
            steps {
                echo " No tests configured (mock data project - skipping)"
                // Add later: sh 'npm test'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    def BUILD_TAG = "${env.BUILD_NUMBER}"
                    sh "docker build -t ${DOCKER_IMAGE}:${BUILD_TAG} -t ${DOCKER_IMAGE}:latest ."
                    echo " Image built: ${DOCKER_IMAGE}:${BUILD_TAG}"
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withDockerRegistry([credentialsId: 'docker-hub-credentials', url: '']) {
                    script {
                        def BUILD_TAG = "${env.BUILD_NUMBER}"
                        sh "docker push ${DOCKER_IMAGE}:${BUILD_TAG}"
                        sh "docker push ${DOCKER_IMAGE}:latest"
                    }
                }
                echo "Pushed to Docker Hub"
            }
        }

        stage('Deploy to EC2') {
            steps {
                sshagent(['ec2-ssh-key']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_IP} << 'EOF'
                            docker pull ${DOCKER_IMAGE}:latest
                            docker stop ${APP_NAME} || true
                            docker rm ${APP_NAME} || true
                            docker run -d --name ${APP_NAME} --restart unless-stopped -p 80:5000 ${DOCKER_IMAGE}:latest
                            docker image prune -f
                        EOF
                    """
                }
                echo " Deployed to http://${EC2_IP}"
            }
        }

        stage('Health Check') {
            steps {
                script {
                    try {
                        sh "curl --fail --retry 3 --retry-delay 5 http://${EC2_IP}/api/health"
                        echo " Health check passed"
                    } catch (Exception e) {
                        error " Health check failed! Check the deployment."
                    }
                }
            }
        }
    }

    post {
        failure {
            echo "DEPLOYMENT FAILED!"
            echo "To rollback: ssh ${EC2_USER}@${EC2_IP} 'docker run -d -p 80:5000 --name ${APP_NAME} ${DOCKER_IMAGE}:last-stable'"
        }
        success {
            echo " SUCCESS! App live at http://${EC2_IP}"
        }
    }
}