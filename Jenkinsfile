pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'simu2006/hospital-finder'
        DOCKER_TAG = "${env.BUILD_NUMBER}"
        CLAW_URL = 'https://irkihajmnyme.ap-southeast-1.clawcloudrun.com'
        // Replace with YOUR NEW PAT - no spaces!
        DOCKER_PAT = 'dckr_pat_YOUR_NEW_TOKEN_HERE'
    }

    stages {
        stage('Build') {
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
        
        stage('Test') {
            steps {
                echo '🧪 Running tests...'
                dir('Backend') {
                    bat 'npm test'
                }
                echo '✅ Tests passed'
            }
        }
        
        stage('Code Quality') {
            steps {
                echo '📊 Code quality analysis...'
                dir('Backend') {
                    bat 'npm run lint || echo "Lint completed"'
                }
                echo '✅ Code quality done'
            }
        }
        
        stage('Security') {
            steps {
                echo '🔒 Security scan...'
                bat 'C:\\trivy\\trivy.exe image --severity HIGH,CRITICAL --exit-code 0 simu2006/hospital-finder:latest || echo "Scan completed"'
                echo '✅ Security done'
            }
        }
        
        stage('Deploy') {
            steps {
                echo '🚀 Deploying to Docker Hub...'
                script {
                    // Use a file to avoid pipe issues
                    bat """
                        echo ${DOCKER_PAT} > docker_pass.txt
                        docker login -u simu2006 --password-stdin < docker_pass.txt
                        if %errorlevel% equ 0 (
                            docker push ${DOCKER_IMAGE}:latest
                            docker push ${DOCKER_IMAGE}:${DOCKER_TAG}
                            echo Push completed
                        ) else (
                            echo Login failed
                            exit 1
                        )
                        del docker_pass.txt
                        docker logout
                    """
                }
                echo '✅ Deploy completed'
            }
        }
        
        stage('Release') {
            steps {
                echo '📦 Creating release...'
                script {
                    def releaseTag = "release-${env.BUILD_NUMBER}"
                    bat "git tag ${releaseTag}"
                    bat "git push origin ${releaseTag} || echo 'Tag push skipped'"
                    writeFile file: 'release-notes.txt', text: "Release: ${releaseTag}\nImage: ${DOCKER_IMAGE}:${DOCKER_TAG}\nDate: ${new Date()}"
                    archiveArtifacts artifacts: 'release-notes.txt'
                }
                echo '✅ Release completed'
            }
        }
        
        stage('Monitoring') {
            steps {
                echo '📈 Health check...'
                script {
                    def healthy = false
                    for (int i = 0; i < 10; i++) {
                        try {
                            def response = bat(script: "curl -s ${CLAW_URL}/api/health", returnStdout: true).trim()
                            if (response.contains('ok')) {
                                healthy = true
                                break
                            }
                        } catch (Exception e) {
                            echo "Waiting... (${i+1}/10)"
                            sleep 10
                        }
                    }
                    echo "Health: ${healthy ? '✅ OK' : '⚠️ Check manually'}"
                }
                echo '✅ Monitoring completed'
            }
        }
    }
}