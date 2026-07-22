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

        VAULT_ADDR = "http://127.0.0.1:8200"
        VAULT_SECRET_PATH = "secret/data/smart-task-management-system"
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

        stage('Fetch Secrets From Vault & Harbor Login') {
    environment {
        VAULT_ADDR = "http://127.0.0.1:8200"
        VAULT_TOKEN = credentials('vault-token-smart')
    }

    steps {
        sh '''
        export HARBOR_USER=$(vault kv get -field=HARBOR_USER secret/smart-task-management-system)
        export HARBOR_PASSWORD=$(vault kv get -field=HARBOR_PASSWORD secret/smart-task-management-system)
        export JWT_SECRET=$(vault kv get -field=JWT_SECRET secret/smart-task-management-system)
        export MONGO_URI=$(vault kv get -field=MONGO_URI secret/smart-task-management-system)

        echo "$HARBOR_PASSWORD" | docker login http://$HARBOR_URL \
            -u "$HARBOR_USER" \
            --password-stdin

        cat <<EOF > .env
JWT_SECRET=$JWT_SECRET
MONGO_URI=$MONGO_URI
EOF
        '''
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
                sh 'docker compose --env-file .env up -d'
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
            sh 'rm -f .env || true'
            cleanWs()
            echo 'Pipeline Finished'
        }
        success {
            echo 'CI/CD Pipeline Executed Successfully'
        }
        failure {
            echo 'CI/CD Pipeline Failed'
        }
    }
}