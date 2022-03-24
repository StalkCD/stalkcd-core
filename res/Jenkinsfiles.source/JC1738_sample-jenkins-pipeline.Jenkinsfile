#!/usr/bin/env groovy
pipeline {
	agent { label 'mesos-qa-uswest2' }
	options {
		// Set to 1 day to allow people to input whether they want to go to Prod on the Master branch build/deploys
		timeout(time: 1, unit: 'DAYS')
	}
	parameters {
		string(defaultValue: 'foo', description: 'test variable', name: 'param1')
	}
	stages {
		//Immediately send github PR all checks that this pipeline will be checking
		stage('Inited Values') {
			agent { label 'mesos-qa-uswest2' }
			steps {
				sh "echo ${params.param1}"
					script {
						env.param1 = params.param1
					}
				echo "${env.param1}"
			}
		}
		stage('Set Values') {
			agent { label 'mesos-qa-uswest2' }
			steps {
				script {
					env.param1 = "bar"
				}
				sh "export param1=foobar"
					script {
						env.param1 = sh (
								script: 'echo $param1',
								returnStdout: true
								).trim()
					}
			}
		}
		stage('Retrieve Values') {
			agent { label 'mesos-qa-uswest2' }
			steps {
				sh "echo ${params.param1}"
					sh "echo ${env.param1}"
					echo "${env.param1}"
					echo "${params.param1}"
			}
		}
		stage('Reset') {
			agent { label 'mesos-qa-uswest2' }
			steps {
				script {
					env.param1 = "foobar2"
				}
			}
		}
		stage('Retrieve Values 2') {
			agent { label 'mesos-qa-uswest2' }
			steps {
				sh "echo ${env.param1}"
			}
		}
	}
	post {
		always {
			echo 'This will always run'

				script {
					def notifier = new org.gradiant.jenkins.slack.SlackNotifier()

						env.SLACK_CHANNEL = '#team-eng-sous-bots, #tech-deploy'
						env.CHANGE_LIST = 'true'
						env.NOTIFY_SUCCESS = 'true'

						notifier.notifyResult()
				}
		}
		success {
			echo 'This will run only if successful'
				githubNotify context: 'Jenkins Overall Success', description: 'PIPELINE all Passed!!!', status: 'SUCCESS'
		}
		failure {
			echo 'This will run only if failed'
				githubNotify context: 'Jenkins Overall Success', description: 'PIPELINE FAILED', status: 'FAILURE'
		}
		unstable {
			echo 'This will run only if the run was marked as unstable'
		}
		changed {
			echo 'This will run only if the state of the Pipeline has changed'
				echo 'For example, if the Pipeline was previously failing but is now successful'
		}
	}
}
