
pipeline {
    agent any
    tools {
     maven 'Maven 3.6.0'   
     jdk 'jdk 1.8'
    }
    stages {
    stage('Build'){
      steps {
        bat 'mvn clean install'
      }
        post{
            success{
                junit 'target/surefire-reports/**/*.xml'
            }
        }  
    }
    
    stage('Test'){
      steps {
        bat "mvn test"
      }
      post{
            success{
                junit 'target/surefire-reports/**/*.xml'
            }
        } 
    }

    stage('Coverage Code'){
      steps {
        bat "mvn cobertura:cobertura -Dcobertura.report.format=xml"
      }
      post{
            success{
                cobertura coberturaReportFile: '**/target/site/cobertura/coverage.xml'
            }
        }

    }

        stage("build & SonarQube analysis") {
            agent any
            steps {
              withSonarQubeEnv('SonarCube') {
                bat 'mvn clean package sonar:sonar'
              }
            }
          }


    /*stage("Quality Gate") {
            steps {
                timeout(time: 1, unit: 'HOURS') {
                    // Parameter indicates whether to set pipeline to UNSTABLE if Quality Gate fails
                    // true = set pipeline to UNSTABLE, false = don't
                    // Requires SonarQube Scanner for Jenkins 2.7+
                    waitForQualityGate abortPipeline: true
                }
            }
        }*/

    stage('JavaDoc Generation'){
      steps {
        bat "mvn javadoc:javadoc"
        bat "mvn site"
      }
    }

    stage('Packaging'){
			steps{
				bat 'mvn package'
		}
	}

	stage('Archivage Nexus'){
		 steps {
        	echo 'Deploying ..'
      	}
	}


    
    stage('Deploy'){
      steps {
        echo 'Deploying ..'
      }
    }
    
  }  
}