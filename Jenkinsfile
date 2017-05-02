#!/usr/bin/env groovy

def docker_registry
def build_number = env.BUILD_NUMBER
def CLEANUP_NUMBER = Integer.parseInt(BUILD_NUMBER) - 3;
def artifactUrl = "https://artifactory.allstate.com/artifactory/libs-release-local/Patches/patches-be-1.${BUILD_NUMBER}.zip"
def artifactToCleanupUrl = "https://artifactory.allstate.com/artifactory/libs-release-local/Patches/patches-be-1.${CLEANUP_NUMBER}.zip"


node {
  docker_registry = env.DOCKER_REGISTRY
    checkout scm
}
//------------------------------------------*** BUILD & TEST ***-----------------------------------------------------------------------------------------
docker.image(docker_registry + '/compozed/ci-base:0.8').inside() {

  stage('Build') {
    sh """
    npm config set registry https://artifactory.allstate.com/artifactory/api/npm/npm
    npm install
    """
    stash name: 'patchescode'
  }

  // Before Tests and Deployment
  withCredentials([
    [
    $class          : 'UsernamePasswordMultiBinding',
    credentialsId   : '0921f265-3d90-4fc0-b589-cc00c1698a6a',
    passwordVariable: 'CF_PASSWORD',
    usernameVariable: 'CF_USERNAME'
    ], [
    $class          : 'UsernamePasswordMultiBinding',
    credentialsId   : 'f33d9b28-ef33-4d0e-9ccd-6fb46fd402bc',
    passwordVariable: 'PAT_DB_PASSWORD',
    usernameVariable: 'PAT_DB_USERNAME'
  ]]) {

  stage('All Tests') {

   sh """
    export ENV=LOCAL
    export ENV_VAR_DATABASE_CRED_USER='A6U_Admin_DEV'
    export ENV_VAR_DATABASE_CRED_PASS=${PAT_DB_PASSWORD}
    export ENV_VAR_DATABASE_DATA_SOURCE='ROST3102.test.allstate.com'
    export ENV_VAR_DATABASE_INITIAL_CATALOG='A6D_Patchitron_DEV'
    export ENV_VAR_DATABASE_AND_SCHEMA='A6D_Patchitron_DEV.A6Schema'
    export ENV_VAR_SCCM_DATABASE_DATA_SOURCE='A0775-SMD0028-S.ad.allstate.com'
    export ENV_VAR_SCCM_DATABASE_INSTANCE='CM_PWC'
    export ENV_VAR_APPID_USER='AD\\sys-cf-pat'
    export ENV_VAR_APPID_PASS=${CF_PASSWORD}
    ./node_modules/.bin/_mocha ./test/unit
    ./node_modules/.bin/_mocha ./test/integration -t 15000
   """
  }
}
}
checkpoint "DEVDeploy"
node {
  try {
    withCredentials([
      [
      $class          : 'UsernamePasswordMultiBinding',
      credentialsId   : '0921f265-3d90-4fc0-b589-cc00c1698a6a',
      passwordVariable: 'CF_PASSWORD',
      usernameVariable: 'CF_USERNAME'
      ], [
      $class          : 'UsernamePasswordMultiBinding',
      credentialsId   : 'f33d9b28-ef33-4d0e-9ccd-6fb46fd402bc',
      passwordVariable: 'PAT_DB_PASSWORD',
      usernameVariable: 'PAT_DB_USERNAME'
      ]]) {

//------------------------------------------*** DEPLOY TO DEVELOPMENT ***-----------------------------------------------------------------------------
  stage(' Parallel Deploy-Dev') {
    parallel (
      "DEV RO11" : {
          sh """
          echo "          ENV: DEV\n          ENV_VAR_APPID_PASS: \"${CF_PASSWORD}\"\n          ENV_VAR_APPID_USER: AD\\${CF_USERNAME}\n          ENV_VAR_DATABASE_AND_SCHEMA: A6D_Patchitron_DEV.A6Schema\n          ENV_VAR_DATABASE_CRED_PASS: \"${PAT_DB_PASSWORD}\"\n          ENV_VAR_DATABASE_CRED_USER: A6U_Admin_DEV\n          ENV_VAR_DATABASE_DATA_SOURCE: ROST3102.test.allstate.com\n          ENV_VAR_DATABASE_INITIAL_CATALOG: A6D_Patchitron_DEV\n          ENV_VAR_SCCM_DATABASE_DATA_SOURCE: A0775-SMD0028-S.ad.allstate.com\n          ENV_VAR_SCCM_DATABASE_INSTANCE: CM_PWC\n" >> manifest_DEV.yml
          cf login -a https://api.cf.nonprod-mpn.ro11.allstate.com --skip-ssl-validation -u ${CF_USERNAME} -p ${CF_PASSWORD}
          cf target -o IS-Patches -s DEV
          cf push -f manifest_DEV.yml
          """
    },
      "DEV RO10" : {
          sh """
          sleep 15
          cf login -a https://api.cf.nonprod-mpn.ro10.allstate.com --skip-ssl-validation -u ${CF_USERNAME} -p ${CF_PASSWORD}
          cf target -o IS-Patches -s DEV
          cf push -f manifest_DEV.yml
          """
        }
  )
  }
}
}
finally {
    stage('DEV Cleanup') {
        step([$class: 'WsCleanup'])
    }
  }
}
//------------------------------------------*** PROMPT BEFORE ARTIFACT and UAT DEPLOY ***-----------------------------------------------------------------------------------------
checkpoint "Post DEVDeploy (when you miss the timeout)"
timeout(time:10, unit:'MINUTES'){
  input 'Do you approve artifact creation and UAT deployment?'
}

node {
    unstash 'patchescode'
  try {
  withCredentials([[
    $class          : 'StringBinding',
    credentialsId   : '6c2863e4-c639-41f4-b931-4243a6c1b653',
    variable        : 'ART_API_TOKEN'
  ]]) {

//------------------------------------------*** DEPLOY TO ARTIFACTORY ***-----------------------------------------------------------------------------
   stage ('Artifactory-Deploy'){
    sh """
      set -e
      set -x
      rm -rf patches-be*
      echo \"Deploying to Artifactory URL: ${artifactUrl}\"
      zip -r patches-be-1.${BUILD_NUMBER}.zip *;
      curl -ik -u sys-cf-pat:${ART_API_TOKEN} -T patches-be-1.${BUILD_NUMBER}.zip \"${artifactUrl}\"
      """
      //Artifactory Cleanup
    sh """
      echo \"Cleaning Artifactory URL: ${artifactToCleanupUrl}\"
      curl -ik -u sys-cf-pat:${ART_API_TOKEN} -X DELETE \"${artifactToCleanupUrl}\"
      """
    }
   }
  }
  finally {
    stage('Artifactory Cleanup') {
        step([$class: 'WsCleanup'])
    }
  }
}

checkpoint "UATDeploy"
node {
try {
withCredentials([
  [
  $class          : 'UsernamePasswordMultiBinding',
  credentialsId   : '0921f265-3d90-4fc0-b589-cc00c1698a6a',
  passwordVariable: 'CF_PASSWORD',
  usernameVariable: 'CF_USERNAME'
  ], [
  $class          : 'UsernamePasswordMultiBinding',
  credentialsId   : 'f33d9b28-ef33-4d0e-9ccd-6fb46fd402bc',
  passwordVariable: 'PAT_DB_PASSWORD',
  usernameVariable: 'PAT_DB_USERNAME'
  ]]) {

//------------------------------------------*** DEPLOY TO UAT ***-----------------------------------------------------------------------------

stage ('Deploy-UAT Conveyor') {
  step([
    $class: "ConveyorJenkinsPlugin",
    applicationName: "patches-be-uat",
    artifactURL: "${artifactUrl}",
    environment: "non-prod",
    manifest: "applications:\n      - name: patches-be-uat\n        memory: 1024MB\n        disk_quota: 1024MB\n        domain: platform-test.allstate.com\n        command: node ./bin/www\n        buildpack: nodejs_buildpack\n        SUPER_SPECIAL_PASSWORD: ${CF_PASSWORD}\n        env:\n          ENV: UAT\n          ENV_VAR_APPID_PASS: \"${CF_PASSWORD}\"\n          ENV_VAR_APPID_USER: 'AD\\${CF_USERNAME}'\n          ENV_VAR_DATABASE_AND_SCHEMA: A6D_Patchitron_DEV.A6Schema\n          ENV_VAR_DATABASE_CRED_PASS: \"${PAT_DB_PASSWORD}\"\n          ENV_VAR_DATABASE_CRED_USER: 'A6U_Admin_DEV'\n          ENV_VAR_DATABASE_DATA_SOURCE: ROST3102.test.allstate.com\n          ENV_VAR_DATABASE_INITIAL_CATALOG: A6D_Patchitron_DEV\n          ENV_VAR_SCCM_DATABASE_DATA_SOURCE: A0775-SMD0028-S.ad.allstate.com\n          ENV_VAR_SCCM_DATABASE_INSTANCE: CM_PWC",
    organization: "IS-PATCHES",
    password: "${CF_PASSWORD}",
    serviceNowGroup: "XP_IS_CHG",
    serviceNowUserID: "sys_rest_patches",
    space: "UAT",
    username: "${CF_USERNAME}"
  ])
}
}
}
finally {
  stage('UAT Cleanup') {
      step([$class: 'WsCleanup'])
  }
}
}

