pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                echo 'Code checked out from GitHub'
            }
        }

        stage('Build Backend Docker Image') {
            steps {
                sh 'docker build -t careerconnect-backend ./backend'
            }
        }

        stage('Build Frontend Docker Image') {
            steps {
                sh 'docker build -t careerconnect-frontend ./frontend'
            }
        }

        stage('Build Complete') {
            steps {
                echo 'Docker images built successfully!'
            }
        }
    }
}