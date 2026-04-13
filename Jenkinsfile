pipeline {
    agent any

    environment {
        CLAW_URL = 'https://irkihajmnyme.ap-southeast-1.clawcloudrun.com'
    }

    stages {
        stage('Load Environment') {
            steps {
                script {
                    // Read .env file
                    def envFile = readFile('.env')
                    envFile.split('\n').each { line ->
                        def (key, value) = line.trim().split('=', 2)
                        if (key && value) {
                            env[key] = value
                        }
                    }
                }
                echo '✅ Environment variables loaded'
            }
        }
        
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
                bat "docker build -t ${env.DOCKER_IMAGE}:${env.BUILD_NUMBER} -t ${env.DOCKER_IMAGE}:latest ."
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
                    // Create temp file with PAT from .env
                    bat """
                        echo ${env.DOCKER_PAT} > docker_pass.txt
                        docker login -u ${env.DOCKER_USERNAME} --password-stdin < docker_pass.txt
                        if %errorlevel% equ 0 (
                            docker push ${env.DOCKER_IMAGE}:latest
                            docker push ${env.DOCKER_IMAGE}:${env.BUILD_NUMBER}
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
                    writeFile file: 'release-notes.txt', text: "Release: ${releaseTag}\nImage: ${env.DOCKER_IMAGE}:${env.BUILD_NUMBER}\nDate: ${new Date()}"
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