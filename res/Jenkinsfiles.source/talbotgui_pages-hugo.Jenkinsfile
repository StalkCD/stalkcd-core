#!groovy

// Définition des propriétés du job : on ne garde que les 5 derniers build
properties([buildDiscarder(logRotator(artifactDaysToKeepStr: '', artifactNumToKeepStr: '', daysToKeepStr: '', numToKeepStr: '5')), pipelineTriggers([])])

pipeline {

	// aucun agent par défaut
	agent none

	stages {
		
		stage ('Checkout') {
			agent any
			steps {

				// clone des sources du site
				checkout scm

				// clone du thème HUGO
				dir('themes') {
				    sh "git clone https://github.com/matcornic/hugo-theme-learn.git"
				}

				stash name: 'sources', includes: '*'
			}
		}
		
		stage ('Build') {
			agent any
			steps {
				unstash 'sources'
				
				// télécharge les dépendances
				sh "npm install"

				// génère le site
				sh "chmod u+x ./hugo-0.26"
				sh "npm run build"

				stash name: 'public', includes: 'public/**/*'
			}
		}

		stage ('Deploy') {
			agent any
			steps {

				// supprime le répertoire 'public'
				dir('public') {
					deleteDir()
				}

				// clone le repository d'hébergement dans le répertoire 'public'
				sh "git submodule add -f -b master https://github.com/talbotgui/talbotgui.github.io.git public"

				// place le site généré dans le répertoire du repo
				sh "rm -rf public/*"
				unstash 'public'

				// commit et push avec les paramètres de compte 'compteGithub' (paramétrage Jenkins)
				dir('public') {
					withCredentials([[$class: 'UsernamePasswordMultiBinding', credentialsId: 'compteGithub', usernameVariable: 'GIT_USERNAME', passwordVariable: 'GIT_PASSWORD']]) {
						sh "git config user.name 'Jenkins de Guillaume TALBOT'"
						sh "git add -A"
						sh "git commit -m 'Publication du site'"
						sh('git push https://${GIT_USERNAME}:${GIT_PASSWORD}@github.com/talbotgui/talbotgui.github.io.git')
					}
				}
			}
		}
	}

	post {
        //success {}
        //unstable {}
        //failure {}
        always {
			node ('') { step([$class: 'WsCleanup', notFailBuild: true]) }
        }
        //changed {}
    }
}
