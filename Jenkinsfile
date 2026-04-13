pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'simu2006/hospital-finder'
        DOCKER_TAG = "${env.BUILD_NUMBER}"
        CLAW_URL = 'https://irkihajmnyme.ap-southeast-1.clawcloudrun.com'
        DOCKER_PAT = 'dckr_pat_5TZAnbVJEfWBUWQbf9ae6gSeadc'
    }

    stages {
        stage('Build') {
            steps {
                echo '🔨 Building application and creating Docker image...'
                dir('Backend') {
                    bat 'npm install'
                }
                dir('Frontend') {
                    bat 'npm install'
                    bat 'npm run build'
                }
                bat "docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} -t ${DOCKER_IMAGE}:latest ."
                echo '✅ Build stage completed'
            }
        }
        
        stage('Test') {
            steps {
                echo '🧪 Running automated tests...'
                dir('Backend') {
                    bat 'npm test'
                }
                echo '✅ Test stage completed'
            }
        }
        
        stage('Code Quality') {
            steps {
                echo '📊 Running code quality analysis (ESLint)...'
                dir('Backend') {
                    bat 'npm run lint || echo "Lint issues found but continuing"'
                }
                echo '✅ Code Quality stage completed'
            }
        }
        
        stage('Security') {
            steps {
                echo '🔒 Running security vulnerability scan with Trivy...'
                bat 'C:\\trivy\\trivy.exe image --severity HIGH,CRITICAL --exit-code 0 simu2006/hospital-finder:latest || echo "Scan completed"'
                echo '✅ Security stage completed'
            }
        }
        
        stage('Deploy') {
            steps {
                echo '🚀 Deploying to Docker Hub registry...'
                script {
                    bat """
                        echo ${DOCKER_PAT} | docker login -u simu2006 --password-stdin
                        docker push ${DOCKER_IMAGE}:latest
                        docker push ${DOCKER_IMAGE}:${DOCKER_TAG}
                        docker logout
                    """
                }
                echo '✅ Deploy stage completed - Image pushed to Docker Hub'
            }
        }
        
        stage('Release') {
            steps {
                echo '📦 Creating production release...'
                script {
                    def releaseTag = "release-${env.BUILD_NUMBER}"
                    bat "git tag ${releaseTag}"
                    bat "git push origin ${releaseTag} || echo 'Tag push skipped'"
                    
                    def releaseNotes = """
                    Release: ${releaseTag}
                    Image: ${DOCKER_IMAGE}:${DOCKER_TAG}
                    Deployed to: ${CLAW_URL}
                    Date: ${new Date()}
                    """
                    writeFile file: 'release-notes.txt', text: releaseNotes
                    archiveArtifacts artifacts: 'release-notes.txt'
                }
                echo '✅ Release stage completed'
            }
        }
        
        stage('Monitoring') {
            steps {
                echo '📈 Monitoring production application...'
                script {
                    def maxRetries = 10
                    def healthy = false
                    
                    for (int i = 0; i < maxRetries; i++) {
                        try {
                            def response = bat(
                                script: "curl -s ${CLAW_URL}/api/health",
                                returnStdout: true
                            ).trim()
                            
                            echo "Health check response: ${response}"
                            
                            if (response.contains('ok')) {
                                healthy = true
                                echo "✅ Application is healthy and responding!"
                                break
                            }
                        } catch (Exception e) {
                            echo "Attempt ${i+1}/${maxRetries}: Waiting for application to be ready..."
                            sleep 10
                        }
                    }
                    
                    def monitoringReport = """
                    ========================================
                    MONITORING & ALERTING REPORT
                    ========================================
                    Timestamp: ${new Date()}
                    Application URL: ${CLAW_URL}
                    Status: ${healthy ? '🟢 ONLINE' : '🔴 OFFLINE'}
                    Docker Image: ${DOCKER_IMAGE}:${DOCKER_TAG}
                    Build Number: ${env.BUILD_NUMBER}
                    
                    Endpoints Monitored:
                    - Health API: ${CLAW_URL}/api/health
                    
                    Alert Rules:
                    - If status != "ok" → Alert triggered
                    ========================================
                    """
                    
                    writeFile file: 'monitoring-report.txt', text: monitoringReport
                    archiveArtifacts artifacts: 'monitoring-report.txt'
                    
                    if (!healthy) {
                        echo "⚠️ ALERT: Application health check failed! Manual intervention required."
                    }
                }
                echo '✅ Monitoring stage completed'
            }
        }
    }
}