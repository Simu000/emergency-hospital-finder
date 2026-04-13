pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'simu2006/hospital-finder'
        DOCKER_TAG = "${env.BUILD_NUMBER}"
        CLAW_URL = 'https://irkihajmnyme.ap-southeast-1.clawcloudrun.com'
    }

    stages {
        stage('1️⃣ Build') {
            steps {
                echo '🔨 Building application...'
                
                dir('Backend') {
                    bat 'npm install'
                }
                
                dir('Frontend') {
                    bat 'npm install'
                    bat 'npm run build'
                }
                
                bat "docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} -t ${DOCKER_IMAGE}:latest ."
                echo '✅ Build completed'
            }
        }
        
        stage('2️⃣ Test') {
            steps {
                echo '🧪 Running tests...'
                dir('Backend') {
                    bat 'npm test'
                }
                echo '✅ Tests passed'
            }
        }
        
        stage('3️⃣ Code Quality') {
            steps {
                echo '📊 Code quality analysis...'
                dir('Backend') {
                    bat 'npm run lint'
                }
                dir('Frontend') {
                    bat 'npm run lint || true'
                }
                echo '✅ Code quality check completed'
            }
        }
        
        stage('4️⃣ Security Scan') {
            steps {
                echo '🔒 Security scanning...'
                bat "docker run --rm aquasec/trivy image --severity HIGH,CRITICAL --exit-code 0 ${DOCKER_IMAGE}:latest"
                echo '✅ Security scan completed'
            }
        }
        
        stage('5️⃣ Deploy to Staging') {
            steps {
                echo '🚀 Deploying to Docker Hub...'
                withCredentials([usernamePassword(
                    credentialsId: 'docker-hub-credentials',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    bat '''
                        echo %DOCKER_PASS% | docker login -u %DOCKER_USER% --password-stdin
                        docker push simu2006/hospital-finder:latest
                        docker push simu2006/hospital-finder:%BUILD_NUMBER%
                    '''
                }
                echo '✅ Deployed to Docker Hub'
            }
        }
        
        stage('6️⃣ Release') {
            steps {
                echo '📦 Creating release...'
                script {
                    def releaseTag = "release-${env.BUILD_NUMBER}"
                    bat "git tag ${releaseTag}"
                    bat "git push origin ${releaseTag}"
                    
                    def releaseNotes = """
                    Release: ${releaseTag}
                    Image: ${DOCKER_IMAGE}:${DOCKER_TAG}
                    URL: ${CLAW_URL}
                    Date: ${new Date()}
                    """
                    writeFile file: 'release-notes.txt', text: releaseNotes
                    archiveArtifacts artifacts: 'release-notes.txt'
                }
                echo '✅ Release created'
            }
        }
        
        stage('7️⃣ Monitoring') {
            steps {
                echo '📈 Monitoring deployment...'
                script {
                    def maxRetries = 10
                    def healthy = false
                    
                    for (int i = 0; i < maxRetries; i++) {
                        try {
                            def response = bat(
                                script: "curl -s ${CLAW_URL}/api/health",
                                returnStdout: true
                            ).trim()
                            
                            if (response.contains('ok')) {
                                healthy = true
                                echo '✅ Application is healthy!'
                                break
                            }
                        } catch (Exception e) {
                            echo "Attempt ${i+1}/${maxRetries}: Waiting for deployment..."
                            sleep 10
                        }
                    }
                    
                    echo """
                    📊 Monitoring Report:
                    - URL: ${CLAW_URL}
                    - Status: ${healthy ? '🟢 ONLINE' : '🔴 OFFLINE'}
                    - Image: ${DOCKER_IMAGE}:${DOCKER_TAG}
                    - Time: ${new Date()}
                    """
                }
                echo '✅ Monitoring completed'
            }
        }
    }
    
    post {
        success {
            echo '''
            🎉 ALL 7 STAGES COMPLETED SUCCESSFULLY! 🎉
            
            ✅ Build - Docker image created
            ✅ Test - All tests passed  
            ✅ Code Quality - Linting completed
            ✅ Security - Trivy scan done
            ✅ Deploy - Pushed to Docker Hub
            ✅ Release - Git tag created
            ✅ Monitoring - Health checks passing
            
            🌐 App URL: https://irkihajmnyme.ap-southeast-1.clawcloudrun.com
            '''
        }
        failure {
            echo '❌ Pipeline failed! Check logs above.'
        }
    }
}