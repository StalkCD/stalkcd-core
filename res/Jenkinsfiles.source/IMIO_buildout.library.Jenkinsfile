@Library('jenkins-pipeline-scripts') _

pipeline {
    agent none
    triggers {
        pollSCM('*/3 * * * *')
    }
    options {
        // Keep the 50 most recent builds
        buildDiscarder(logRotator(numToKeepStr:'30'))
    }
    stages {
        stage('Build') {
            agent any
            steps {
                sh 'make docker-image'
            }
        }
        stage('Push image to registry') {
            agent any
            steps {
                pushImageToRegistry (
                    env.BUILD_ID,
                    'library/mutual'
                )
            }
        }
        stage('Deploy to staging') {
            agent any
            when {
                expression {
                    currentBuild.result == null || currentBuild.result == 'SUCCESS'
                }
            }
            steps {
                sh "mco shell run 'docker pull docker-staging.imio.be/library/mutual:$BUILD_ID' -I /^staging.imio.be/"
                sh "mco shell run 'systemctl restart bibliotheca.service' -I /^staging.imio.be/"
            }
        }
        stage('Deploy to prod') {
            agent any
            when {
                expression {
                    currentBuild.result == null || currentBuild.result == 'SUCCESS'
                }
            }
            steps {
                sh "docker pull docker-staging.imio.be/library/mutual:$BUILD_ID"
                sh "docker tag docker-staging.imio.be/library/mutual:$BUILD_ID docker-prod.imio.be/library/mutual:$BUILD_ID"
                sh "docker tag docker-staging.imio.be/library/mutual:$BUILD_ID docker-prod.imio.be/library/mutual:latest"
                sh "docker push docker-prod.imio.be/library/mutual"
                sh "docker rmi docker-staging.imio.be/library/mutual:$BUILD_ID"
                sh "docker rmi docker-prod.imio.be/library/mutual:latest"
                sh "docker rmi docker-prod.imio.be/library/mutual:$BUILD_ID"
                sh "mco shell run 'docker pull docker-prod.imio.be/library/mutual:$BUILD_ID' -I /^bibliotheca.imio.be/"
                sh "mco shell run 'systemctl restart bibliotheca.service' -I /^bibliotheca.imio.be/"
                sh "mco shell run 'systemctl restart couvin.service' -I /^bibliotheca.imio.be/"
                sh "mco shell run 'systemctl restart sambreville.service' -I /^bibliotheca.imio.be/"
            }
        }
    }
}
