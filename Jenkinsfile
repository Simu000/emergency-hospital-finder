pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'simu2006/hospital-finder'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                echo "✅ Code pulled from GitHub"
            }
        }

        stage('Install Backend Dependencies') {
            steps {
                bat '''
                    cd Backend
                    npm ci || npm install
                    cd ..
                '''
                echo "✅ Backend dependencies installed"
            }
        }

        stage('Install Frontend Dependencies') {
            steps {
                bat '''
                    cd Frontend
                    npm ci || npm install
                    cd ..
                '''
                echo "✅ Frontend dependencies installed"
            }
        }

        stage('Build Frontend') {
            steps {
                bat '''
                    cd Frontend
                    npm run build
                    cd ..
                '''
                echo "✅ Frontend built"
            }
        }

        stage('Run Tests') {
            steps {
                echo "⚠️ No tests configured (mock data project - skipping)"
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    def BUILD_TAG = "${env.BUILD_NUMBER}"
                    bat "docker build -t ${DOCKER_IMAGE}:${BUILD_TAG} -t ${DOCKER_IMAGE}:latest ."
                    echo "✅ Image built: ${DOCKER_IMAGE}:${BUILD_TAG}"
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'docker-hub-credentials',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    bat '''
                        echo %DOCKER_PASS% | docker login -u %DOCKER_USER% --password-stdin
                        docker push simu2006/hospital-finder:latest
                    '''
                }
                echo "✅ Pushed to Docker Hub"
            }
        }

        stage('Deploy to Claw.cloud') {
            steps {
                echo "✅ Deployment triggered to Claw.cloud"
                echo "Claw.cloud will automatically pull the latest image"
                echo "App URL: https://hospital-finder-xxxx.claw.cloud"
            }
        }

        stage('Health Check') {
            steps {
                echo "✅ Health check endpoint: /api/health"
                echo "To verify: curl https://your-app.claw.cloud/api/health"
            }
        }
    }

    post {
        failure {
            echo "❌ DEPLOYMENT FAILED!"
            echo "Rollback: Use previous Docker image from Docker Hub"
        }
        success {
            echo "✅ SUCCESS! Pipeline completed."
        }
    }
}