pipeline {
  agent none

  options {
    timestamps()
    disableConcurrentBuilds()
    preserveStashes(buildCount: 5)
  }

  environment {
    AWS_DEFAULT_REGION='eu-west-1'
    SERVICE="showcar-icons"
  }

  stages {
    stage('Build') {
      when {
        beforeAgent true
        branch 'master'
      }

      agent { node { label 'deploy-as24dev-node' } }

      steps {
        sh 'echo "Build some stuff..."'
        sh './deploy/build.sh'
        stash includes: 'dist/**/*', name: 'output-dist'
      }
    }

    stage('DeployDev') {
      when {
        beforeAgent true
        branch 'master'
      }

      environment {
        BRANCH="develop"
      }

      agent { node { label 'deploy-as24dev-node' } }

      steps {
        sh 'echo "DeployDev..."'
        unstash 'output-dist'
        sh './deploy/deploy.sh'
      }
    }

    stage('DeployProd') {
      when {
        beforeAgent true
        branch 'master'
      }

      environment {
        BRANCH="master"
      }

      agent { node { label 'deploy-as24dev-node' } }

      steps {
        sh 'echo "DeployProd..."'
        unstash 'output-dist'
        sh './deploy/deploy.sh'
      }
    }
  }

  post {
    failure {
        echo 'Pipeline failed 💣'
        slackSend channel: 'as24_acq_cxp_fizz', color: '#FF0000', message: "💣 ${env.JOB_NAME} [${env.BUILD_NUMBER}] failed. (<${env.BUILD_URL}|Open>)"
    }
  }
}
