pipeline {
    agent any

    tools {
        nodejs 'Node20'
    }

    environment {
        SCANNER_HOME = tool 'SonarScanner'

        HARBOR_URL = "192.168.1.29"
        HARBOR_PROJECT = "smart-task-management-system"

        AUTH_IMAGE = "smart-task-management-system-auth-service"
        TASK_IMAGE = "smart-task-management-system-task-service"
        NOTIFICATION_IMAGE = "smart-task-management-system-notification-service"
        REPORT_IMAGE = "smart-task-management-system-report-service"
        API_IMAGE = "smart-task-management-system-api-gateway"
        FRONTEND_IMAGE = "smart-task-management-system-frontend"

        IMAGE_TAG = "v1"
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
                sh '''
                cd frontend && npm install

                cd ../auth-service_1784011000189 && npm install

                cd ../task-service && npm install

                cd ../notification-service && npm install

                cd ../report-service && npm install

                cd ../api-gateway_1784010924579 && npm install
                '''
            }
        }

        stage('SonarQube Scan') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh """
                    ${SCANNER_HOME}/bin/sonar-scanner \
                    -Dsonar.projectKey=Smart-Task-Management-System \
                    -Dsonar.projectName=Smart-Task-Management-System \
                    -Dsonar.sources=. \
                    -Dsonar.sourceEncoding=UTF-8
                    """
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
                sh 'trivy fs --severity HIGH,CRITICAL --format table .'
            }
        }

        stage('Build Docker Images') {
            steps {
                sh 'docker compose build'
            }
        }

        stage('Trivy Docker Image Scan') {
            steps {
                sh """
                trivy image --severity HIGH,CRITICAL ${AUTH_IMAGE}:latest
                trivy image --severity HIGH,CRITICAL ${TASK_IMAGE}:latest
                trivy image --severity HIGH,CRITICAL ${NOTIFICATION_IMAGE}:latest
                trivy image --severity HIGH,CRITICAL ${REPORT_IMAGE}:latest
                trivy image --severity HIGH,CRITICAL ${API_IMAGE}:latest
                trivy image --severity HIGH,CRITICAL ${FRONTEND_IMAGE}:latest
                """
            }
        }

        stage('Start Harbor') {
            steps {
                sh '''
                cd /opt/harbor
                docker compose up -d
                sleep 30
                '''
            }
        }

        stage('Harbor Login') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'harbor-creds',
                        usernameVariable: 'HARBOR_USER',
                        passwordVariable: 'HARBOR_PASS'
                    )
                ]) {
                    sh '''
                    echo "$HARBOR_PASS" | docker login $HARBOR_URL \
                    -u "$HARBOR_USER" \
                    --password-stdin
                    '''
                }
            }
        }

        stage('Tag Docker Images') {
            steps {
                sh """
                docker tag ${AUTH_IMAGE}:latest $HARBOR_URL/$HARBOR_PROJECT/auth-service:${IMAGE_TAG}

                docker tag ${TASK_IMAGE}:latest $HARBOR_URL/$HARBOR_PROJECT/task-service:${IMAGE_TAG}

                docker tag ${NOTIFICATION_IMAGE}:latest $HARBOR_URL/$HARBOR_PROJECT/notification-service:${IMAGE_TAG}

                docker tag ${REPORT_IMAGE}:latest $HARBOR_URL/$HARBOR_PROJECT/report-service:${IMAGE_TAG}

                docker tag ${API_IMAGE}:latest $HARBOR_URL/$HARBOR_PROJECT/api-gateway:${IMAGE_TAG}

                docker tag ${FRONTEND_IMAGE}:latest $HARBOR_URL/$HARBOR_PROJECT/frontend:${IMAGE_TAG}
                """
            }
        }

        stage('Push Images to Harbor') {
            steps {
                sh """
                docker push $HARBOR_URL/$HARBOR_PROJECT/auth-service:${IMAGE_TAG}

                docker push $HARBOR_URL/$HARBOR_PROJECT/task-service:${IMAGE_TAG}

                docker push $HARBOR_URL/$HARBOR_PROJECT/notification-service:${IMAGE_TAG}

                docker push $HARBOR_URL/$HARBOR_PROJECT/report-service:${IMAGE_TAG}

                docker push $HARBOR_URL/$HARBOR_PROJECT/api-gateway:${IMAGE_TAG}

                docker push $HARBOR_URL/$HARBOR_PROJECT/frontend:${IMAGE_TAG}
                """
            }
        }

        stage('Deploy Application') {
            steps {
                sh 'docker compose up -d'
            }
        }

        stage('Verify Deployment') {
            steps {
                sh 'docker ps'
            }
        }
    }

    post {
        always {
            cleanWs()
            echo 'Pipeline Finished'
        }

        success {
            echo 'CI Pipeline Completed Successfully'
        }

        failure {
            echo 'CI Pipeline Failed'
        }
    }
}