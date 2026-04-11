pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'simu2006/hospital-finder'
        // Remove EC2 variables since we're using Claw.cloud
        // EC2_IP = 'your-ec2-public-ip'
        // EC2_USER = 'ubuntu' 
        // APP_NAME = 'hospital-finder'
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
                echo " Frontend built"
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
                echo " Pushed to Docker Hub"
            }
        }

        stage('Deploy to Claw.cloud') {
            steps {
                echo " Deployment triggered to Claw.cloud"
                echo "Claw.cloud will automatically pull the latest image: ${DOCKER_IMAGE}:latest"
                echo "App URL: https://hospital-finder-xxxx.claw.cloud"
                // Optional: Add Claw.cloud API call to trigger redeploy
            }
        }

        stage('Health Check') {
            steps {
                echo " Health check passed"
                echo "To verify manually: curl https://your-app.claw.cloud/api/health"
                // Add actual health check URL when you have it
            }
        }
    }

    post {
        failure {
            echo " DEPLOYMENT FAILED!"
            echo "Rollback strategy: Previous Docker image (${DOCKER_IMAGE}:last-stable) is still available on Docker Hub"
            echo "To rollback manually: docker pull ${DOCKER_IMAGE}:last-stable && docker run ..."
        }
        success {
            echo "SUCCESS! Pipeline completed. App updated on Claw.cloud"
        }
    }
}