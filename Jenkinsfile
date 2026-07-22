
pipeline {
    agent any

    tools {
        nodejs 'Node20'
    }

    environment {
        IMAGE_NAME = "smart-task-management-system"
        DOCKER_COMPOSE = "docker compose"
        SCANNER_HOME = tool 'SonarScanner'
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/KameshS021/Smart-Task-Management-System.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'cd frontend && npm install'
                sh 'cd auth-service_1784011000189 && npm install'
                sh 'cd task-service && npm install'
                sh 'cd notification-service && npm install'
                sh 'cd report-service && npm install'
                sh 'cd api-gateway_1784010924579 && npm install'
            }
        }

        stage('SonarQube Scan') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh '''
                    ${SCANNER_HOME}/bin/sonar-scanner \
                    -Dsonar.projectKey=Smart-Task-Management-System \
                    -Dsonar.projectName=Smart-Task-Management-System \
                    -Dsonar.sources=. \
                    -Dsonar.sourceEncoding=UTF-8
                    '''
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Trivy File System Scan') {
            steps {
                sh '''
                trivy fs \
                --severity HIGH,CRITICAL \
                --format table \
                .
                '''
            }
        }

        stage('Build Docker Images') {
            steps {
                sh 'docker compose build'
            }
        }

        stage('Trivy Docker Image Scan') {
            steps {
                sh '''
                trivy image --severity HIGH,CRITICAL --format table smart-task-management-system-auth-service:latest

                trivy image --severity HIGH,CRITICAL --format table smart-task-management-system-task-service:latest

                trivy image --severity HIGH,CRITICAL --format table smart-task-management-system-notification-service:latest

                trivy image --severity HIGH,CRITICAL --format table smart-task-management-system-report-service:latest

                trivy image --severity HIGH,CRITICAL --format table smart-task-management-system-api-gateway:latest

                trivy image --severity HIGH,CRITICAL --format table smart-task-management-system-frontend:latest
                '''
            }
        }

        stage('Start Containers') {
            steps {
                sh 'docker compose up -d'
            }
        }

        stage('Verify Running Containers') {
            steps {
                sh 'docker ps'
            }
        }
    }

    post {
        always {
            echo 'Pipeline Finished'
            cleanWs()
        }

        success {
            echo 'Deployment Successful'
        }

        failure {
            echo 'Pipeline Failed'
        }
    }
} 