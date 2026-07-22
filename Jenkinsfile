pipeline {
    agent any

    tools {
        nodejs 'Node20'
    }

    environment {
        IMAGE_NAME = "smart-task-management-system"
        DOCKER_COMPOSE = "docker compose"
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

        stage('Build Docker Images') {
            steps {
                sh 'docker compose build'
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
        }

        success {
            echo 'Deployment Successful'
        }

        failure {
            echo 'Pipeline Failed'
        }
    }
} 