# Generate missing trade skill entries
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# All 73 trades mapped to skill keys
$tradeMap = @{
  "Airport Shuttle" = "AIRPORT_SHUTTLE"
  "Appliance Repair" = "APPLIANCE_REPAIR"
  "Arborist" = "ARBORIST"
  "Auto Electrician" = "AUTO_ELECTRICIAN"
  "Borehole Driller" = "BOREHOLE_DRILLER"
  "Bricklayer/Mason" = "BRICKLAYER_MASON"
  "Builder/General Contractor" = "GENERAL_BUILDER_HANDYMAN"
  "Cabinet Maker" = "CARPENTER_FINISH_JOINER"
  "Carpenter" = "CARPENTER_STRUCTURAL"
  "CCTV/Alarm" = "SECURITY_ACCESS_CONTROL"
  "Ceiling & Partitioning" = "CEILING_INSTALLER"
  "Chauffeur" = "CHAUFFEUR"
  "Concreter" = "CONCRETOR"
  "Courier" = "COURIER"
  "Curtain & Blind Installer" = "CURTAIN_BLIND_INSTALLER"
  "Debushing" = "DEBUSHING"
  "Demolition Specialist" = "DEMOLITION_CONTRACTOR"
  "Drip Irrigation" = "IRRIGATION_TECHNICIAN"
  "DSTV/Satellite" = "DSTV_SATELLITE"
  "Electrician" = "ELECTRICIAN"
  "Errand Runner" = "ERRAND_RUNNER"
  "Excavator" = "HEAVY_PLANT_OPERATOR"
  "Farm Hand" = "FARM_HAND"
  "Fencing" = "FENCING_CONTRACTOR"
  "Firewood Delivery" = "FIREWOOD_DELIVERY"
  "Floor Layer" = "FLOORING_POLISHER_CONCRETE_TERRAZZO"
  "Furniture Removal" = "FURNITURE_REMOVAL"
  "Gas Cylinder Delivery" = "GAS_CYLINDER_DELIVERY"
  "Gas Fitter" = "GAS_INSTALLER"
  "Gate Motor/Intercom" = "SECURITY_ACCESS_CONTROL"
  "Generator Technician" = "GENERATOR_TECHNICIAN"
  "Glazier" = "GLASS_GLAZING_SPECIALIST"
  "Handyman" = "GENERAL_BUILDER_HANDYMAN"
  "HVAC Technician" = "HVAC_TECHNICIAN"
  "Joiner" = "CARPENTER_FINISH_JOINER"
  "Landscaper" = "LANDSCAPER_GARDENER"
  "Livestock Branding" = "LIVESTOCK_BRANDING"
  "Livestock Transporter" = "LIVESTOCK_TRANSPORTER"
  "Locksmith" = "LOCKSMITH"
  "Mechanic" = "MECHANIC"
  "Mobile Catering" = "MOBILE_CATERING"
  "Mobile Money Agent" = "MOBILE_MONEY_AGENT"
  "Mobile Toilet" = "MOBILE_TOILET"
  "PA/DJ" = "PA_DJ"
  "Painter/Decorator" = "PAINTER_DECORATOR"
  "Panel Beater" = "PANEL_BEATER"
  "Paving" = "PAVING_CONTRACTOR"
  "Pest Control" = "PEST_CONTROL"
  "Phone/Laptop Repair" = "PHONE_LAPTOP_REPAIR"
  "Pipelayer" = "PIPELAYER"
  "Plasterer" = "PLASTERER_DRYWALL"
  "Plumber" = "PLUMBER"
  "Roofer" = "ROOFER"
  "Scaffolder" = "SCAFFOLDER"
  "Shopfitter" = "SHOPFITTER"
  "Solar Installer" = "SOLAR_INSTALLER"
  "Steel Fixer" = "STEEL_FIXER"
  "Stonemason" = "STONEMASON"
  "Swimming Pool" = "SWIMMING_POOL"
  "Taxi/Combi" = "TAXI_COMBI"
  "Telecom/Fibre Installer" = "TELECOM_FIBRE_INSTALLER"
  "Tent & Decor" = "TENT_DECOR"
  "Thatcher" = "THATCHER"
  "Tiler" = "TILER_FLOORING_SPECIALIST"
  "Tow Truck" = "TOW_TRUCK"
  "Truck Driver" = "TRUCK_DRIVER"
  "Tyre Specialist" = "TYRE_SPECIALIST"
  "Upholsterer" = "UPHOLSTERER"
  "Vehicle Transporter" = "VEHICLE_TRANSPORTER"
  "Water Delivery" = "WATER_DELIVERY"
  "Water Tank Installer" = "WATER_TANK_INSTALLER"
  "Waterproofing" = "WATERPROOFING_SPECIALIST"
  "Welder" = "WELDER_FABRICATOR"
}

# Existing skill keys in tradesman_skills.json (40)
$existingKeys = @(
  "BRICKLAYER_MASON","CARPENTER_STRUCTURAL","STEEL_FIXER","CONCRETOR","SCAFFOLDER",
  "DEMOLITION_CONTRACTOR","HEAVY_PLANT_OPERATOR","WELDER_FABRICATOR","TILER_FLOORING_SPECIALIST",
  "PAINTER_DECORATOR","PLASTERER_DRYWALL","CEILING_INSTALLER","CARPENTER_FINISH_JOINER",
  "GLASS_GLAZING_SPECIALIST","FLOORING_POLISHER_CONCRETE_TERRAZZO","PLUMBER","ELECTRICIAN",
  "SOLAR_INSTALLER","HVAC_TECHNICIAN","APPLIANCE_REPAIR","GAS_INSTALLER","LANDSCAPER_GARDENER",
  "IRRIGATION_TECHNICIAN","PAVING_CONTRACTOR","FENCING_CONTRACTOR","FIRE_PROTECTION_TECHNICIAN",
  "SECURITY_ACCESS_CONTROL","WATERPROOFING_SPECIALIST","ACOUSTIC_INSTALLER","SHADE_PERGOLA_INSTALLER",
  "SKIP_WASTE_OPERATOR","UNIFORM_SUPPLIER","INTERIOR_DECORATOR","KITCHEN_BATHROOM_DESIGNER",
  "ARCHITECT_DRAFTSMAN","CLEANING_SERVICE_POST_CONSTRUCTION","TRAINING_FACILITATOR_TRADE",
  "GENERAL_BUILDER_HANDYMAN","MAINTENANCE_TECHNICIAN_INDUSTRIAL"
)

# Generate 15 skills for each new trade
$newSkills = @{}

function Generate-Skills($key) {
  $skills = @()
  $base = $key.ToLower() -replace '_', ' '
  $words = $base -split ' '
  
  # Generate 15 camelCase skill names
  $templates = @(
    "qualityOfWork", "accuracyPrecision", "safetyCompliance", "customerService", "timeManagement",
    "toolMaintenance", "problemSolving", "teamCoordination", "documentationReporting", "costEfficiency",
    "materialHandling", "sitePreparation", "equipmentOperation", "inspectionTesting", "postJobCleanup"
  )
  
  # Customize first 5 based on trade name, use templates for rest
  $s = @()
  for ($i = 0; $i -lt $words.Count; $i++) {
    $w = $words[$i]
    if ($w -eq 'and' -or $w -eq 'or') { continue }
    switch ($i) {
      0 { $s += "${w}Measurement" }
      1 { $s += "${w}Installation" }
      default { $s += "${w}Technique" }
    }
  }
  if ($s.Count -lt 3) { $s += "${words[0]}Setup" }
  if ($s.Count -lt 3) { $s += "${words[0]}Finishing" }
  if ($s.Count -lt 5) { $s += "${words[0]}Assessment" }
  
  $skills = $s[0..4]
  $skills += $templates | Select-Object -First 10
  return $skills
}

# Skill templates for each new trade - hand-crafted for quality
function Get-CustomSkills($key) {
  $skillSets = @{
    "ROOFER" = @("roofSheetInstallation","flashingSealing","trussAlignmentFixing","ridgeCapping","gutterDownpipeInstall","waterproofUnderlayment","safeFallProtection","tileSlateCutting","valleyFlashingDetail","roofVentInstallation","eavesFasciaFinishing","skylightFlashing","roofWalkBoards","leadFlashingWeathered","roofInspectionReporting")
    "STONEMASON" = @("stoneCuttingShaping","mortarMixingColor","wallCoursingAlignment","cornerStoneFinish","dryStoneStacking","ashlarFitting","pointingRepointing","stoneCleaningRestoration","archVaultConstruction","carvingLettering","plinthBaseDetail","copingStonePlacement","dampCourseIntegration","scaffoldSafeSetup","stoneMatchingBlending")
    "BOREHOLE_DRILLER" = @("drillRigSetup","boreholeDepthMeasurement","casingPipeInstallation","waterYieldTesting","drillingMudManagement","aquiferIdentification","screenSlotSelection","gravelPackPlacement","pumpHeadInstallation","waterQualitySampling","boreholeDevelopment","yieldDrawdownTest","drillBitSelection","safetyHazardAssessment","logBookMaintenance")
    "THATCHER" = @("thatchBundleSelection","roofPitchAngle","thatchLayeringEvenness","ridgeCappingWeave","wireTieSecuring","fireRetardantTreatment","eavesCuttingNeat","gableFinishing","canePoleStructure","thatchDensityConsistency","waterRunoffGrading","ventilationRidgeInsert","battensPurlinsSpacing","thatchDepthMeasurement","maintenanceInspection")
    "PIPELAYER" = @("trenchExcavationDepth","pipeJointFusion","slopeGradientCheck","beddingCompaction","backfillLayering","saddlesTeeInstallation","valveChamberConstruction","trenchSafetyShoring","hydrostaticPressureTest","pipeBendingAlignment","manholeConeInstallation","roadCrossingCasing","cutbackWeldInspection","pipeMarkerInstallation","asBuiltSurveyDrawing")
    "GENERATOR_TECHNICIAN" = @("engineDiagnosis","alternatorWindingCheck","automaticTransferSwitch","loadBankTesting","fuelSystemBleeding","batteryChargingSystem","coolantLeakRepair","airFilterServicing","exhaustSystemInstallation","oilChangeProcedure","wiringControlPanel","generatorSizingCalculation","remoteMonitoringSetup","soundAttenuationEnclosure","emergencyStopTesting")
    "TELECOM_FIBRE_INSTALLER" = @("fibreSplicingFusion","cableRoutingManagement","connectorPolishing","splicingTrayOrganisation","fibreOpticTesting","wallBoxInstallation","overheadCableLashing","undergroundCableLaying","cableCoatStripping","spliceLossMeasurement","patchPanelTermination","opticalTimeDomainReflectometer","aerialCableTension","customerPremisesEquipment","safetyLadderUse")
    "WATER_TANK_INSTALLER" = @("tankBasePreparation","plumbingConnections","overflowPipeInstallation","gutterDiverterFitting","tankStandWelding","rainwaterHarvestingSetup","firstFlushDiverter","tankLevelIndicator","overflowMosquitoScreen","downpipeConnection","pumpInstallation","pressureVesselSetup","tankCleaningDisinfection","civetCatchmentInstallation","waterTestingSampling")
    "ARBORIST" = @("treeClimbingTechnique","pruningCutPlacement","riggingCableUse","stumpGrinding","chainSawMaintenance","hazardAssessment","rootCrownExposure","canopyThinning","emergencyFellingDirection","woodChipMulching","treeHealthAssessment","branchStrengthEvaluation","cableBracingInstallation","climbingRopeInspection","chipperOperation")
    "SWIMMING_POOL" = @("poolShellPlastering","tileInstallationWaterproof","filtrationPlumbing","pumpMotorInstallation","poolLightingWiring","copingEdgeFinishing","chemicalDosingSystem","poolCoverInstallation","heaterHeatPumpSetup","skimmerWeirAdjustment","backwashValveAssembly","leakDetectionRepair","autoCleanerInstallation","waterBalanceTesting","poolSafetyFencing")
    "LOCKSMITH" = @("lockPickPinning","keyCuttingAccuracy","safeDrilling","doorHardwareInstallation","masterKeySystemDesign","electronicLockProgramming","mortiseLockInstallation","keyDuplicatePrecision","lockRebuilding","hingeAlignmentAdjustment","keypadWiringSetup","carKeyProgramming","patentedKeyCutting","emergencyEntryTechnique","lockScopeInspection")
    "PEST_CONTROL" = @("termiteDetectionTreatment","rodentExclusionSealing","insectIdentification","sprayChemicalMixing","baitStationPlacement","fumigationTenting","cockroachGelApplication","mosquitoFogging","bedBugSteamTreatment","flyControlManagement","waspNestRemoval","fungusTreatmentSpray","birdProofingInstallation","safetyPPEUse","treatmentDocumentation")
    "UPHOLSTERER" = @("fabricCuttingMatching","foamCushioningLayering","stitchingSeamStrength","springTyingTechnique","buttonTuftingPattern","leatherRepairRestoration","frameRebuilding","pipingCordInsertion","zipperInstallation","headboardPadding","sofaReclinerMechanism","velvetVelourHandling","oilSkinCanvasWork","fireRetardantFabric","customerFabricConsultation")
    "AUTO_ELECTRICIAN" = @("wiringHarnessRepair","starterMotorRebuild","alternatorRebuildTesting","batteryTestingLoad","relayFuseDiagnosis","centralLockingInstallation","carAlarmWiring","CANbusDiagnostics","lightingCircuitTesting","sensorReplacementCalibration","trailerWiringHarness","windshieldWiperMotor","powerWindowRepair","engineControlUnitDiagnosis","parasiticDrawTesting")
    "MECHANIC" = @("engineOverhaulProcedure","brakeSystemService","suspensionBusyRepair","timingBeltReplacement","clutchPressurePlate","gearboxRemovalInstallation","differentialService","oilFilterChange","coolantFlushProcedure","airConditioningService","wheelAlignmentBalancing","exhaustPipeWelding","diagnosticScannerUse","serviceScheduleCheck","testDriveAssessment")
    "PANEL_BEATER" = @("dentRepairPull","bodyFillerApplication","sprayPaintFinishing","panelAlignmentGaps","weldingThinGauge","frameStraighteningMeasurement","colorMatchingSpray","sandingBlockTechnique","clearCoatApplication","bumperRepairPlastic","rustCuttingWelding","maskingTapProcedure","paintOvenBaking","hammerDollyTechnique","trimReassembly")
    "TOW_TRUCK" = @("truckManeuveringReverse","winchCableOperation","wheelLiftSecuring","vehicleStrappingTieDown","flatbedLoading","accidentSceneTrafficControl","underslungTowing","recoveryStrapsUse","axleLockPrevention","brakeLineDisconnect","driveshaftRemoval","lightbarSafetyOperation","customerCommunication","policeCoordination","truckDailyInspection")
    "TYRE_SPECIALIST" = @("tyreFittingBalancing","wheelAlignmentTracking","punctureRepairVulcanising","tyrePressureMonitoring","runFlatTyreHandling","sidewallDamageAssessment","tyreRotationPattern","valveStemReplacement","tyreAgeDateCheck","matchingDualTyreFit","wheelNutTorquing","tyreNoiseDiagnosis","snowTyreInstallation","tyreStorageStacking","customerTyreAdvice")
    "FURNITURE_REMOVAL" = @("furnitureWrappingPadding","truckLoadingTetris","stairCaseManeuvering","disassemblyReassembly","pianoApplianceMoving","fragileItemPacking","inventoryChecklist","wallCornerProtection","teamLiftingCoordination","furnitureAnchorDisconnect","dollyStrapUse","elevatorBookingTiming","deliveryRoomPlacement","storageContainerPacking","damageClaimPhotography")
    "CHAUFFEUR" = @("defensiveDrivingTechnique","routePlanningOptimisation","vehicleCleanlinessPresentation","passengerAssistance","wineGlassSafeTransport","luggageHandlingLoading","doorServiceEtiquette","trafficPatternKnowledge","tierSchedulePunctuality","vehiclePreTripInspection","parkingManeuvering","communicationSkills","confidentialityProtocol","firstAidCertification","gpsNavigationSetup")
    "TRUCK_DRIVER" = @("loadSecuringStrapping","hitchCouplingCheck","airBrakeTesting","preTripInspection","fuelEfficientDriving","reverseManeuveringDock","loadDistributionBalance","tachographLogging","hazardousMaterialSafety","tarpCoverInstallation","weightDistributionAxle","hillStartProcedure","chainTyreInstallation","restStopScheduling","breakDownSafetyProtocol")
    "TAXI_COMBI" = @("passengerManagement","fareCalculation","routeKnowledge","vehicleCleanliness","defensiveDriving","meterUsageAccuracy","emergencyVehicleProcedure","luggageRackLoading","hailResponseTimeliness","rankQueuingEtiquette","nightDrivingSafety","disabledPassengerAssistance","cashlessPaymentHandling","vehicleInteriorSanitisation","driverProfessionalism")
    "AIRPORT_SHUTTLE" = @("flightTrackMonitoring","baggageHandlingCare","terminalPickupProtocol","childSeatInstallation","wheelchairAssistance","onTimePerformance","passengerManifestCheck","luggageLabelMatching","waitingAreaProcedure","multiStopRoutePlanning","largeGroupManagement","gpsTrafficAvoidance","vehicleSignageDisplay","phoneCallNotification","receiptInvoiceProvision")
    "VEHICLE_TRANSPORTER" = @("rampLoadingAngle","wheelNetStrapping","tieDownRacheting","vehicleDriveOnPositioning","loadHeightCheck","overhangSignagePlacement","axleWeightDistribution","trailerCoupledSafety","airLineElectricalConnection","lowClearanceNavigation","permitRoutePlanning","dollySteeringMonitor","winchLoadingNonRunner","euroRampLoadingUnloading","deliveryPhotoDocumentation")
    "LIVESTOCK_TRANSPORTER" = @("livestockLoadingRamp","animalStressReduction","ventilationAirflowControl","waterProvisionEnRoute","stockingDensityCalculation","headBailInstallation","dehorningBeforeTransport","transportPermitDocumentation","cleanoutDisinfectionBetween","feedRestPeriodTiming","animalHealthCheck","temperatureMonitoring","antiSlipFlooring","roofInsulationHeatReflect","unloadingRampGentle")
    "COURIER" = @("parcelSortingEfficiency","deliveryRouteOptimisation","packageSecurePackaging","signatureProofCollection","timeSlotAdherence","trackingScanProcedure","fragileItemHandling","cashOnDeliveryHandling","addressVerification","returnPickupProcess","bulkyItemTeamLift","coldChainPackageCare","customerNotificationProtocol","vehicleLoadOrganization","dailyVehicleCheck")
    "ERRAND_RUNNER" = @("taskPriorityManagement","shoppingListAccuracy","deliveryTimeliness","cashPaymentHandling","receiptCollectionOrganisation","multiStopRouteEfficiency","queuingTimeMinimisation","documentDropOffPickup","pharmacyPrescriptionPickup","laundryDropCollection","groceriesFreshnessCheck","packagingBagging","clientCommunicationUpdate","punctualityReliability","mobileAppNavigation")
    "WATER_DELIVERY" = @("bowserTankCleaning","waterQualityTesting","hoseConnectionSanitation","deliveryVolumeMeter","pumpOperationProcedure","customerTankFilling","spillPreventionProcedure","deliverySchedulingEfficiency","vehicleTankRefill","paymentCollection","routePlanningOptimisation","customerCisternAccess","waterCertificationProof","emergencyDeliveryResponse","hoseReelMaintenance")
    "FIREWOOD_DELIVERY" = @("woodSeasoningCheck","logSplittingConsistency","measurementCubicMeter","stackDeliveryArrangement","moistureContentTesting","vehicleLoadingCapacity","tarpaulinCoverSecuring","customerStackPlacement","speciesIdentification","chainsawSafetyOperation","firewoodKilnDrying","splitterMachineOperation","pricingByVolume","deliveryAccessAssessment","seasonalStockManagement")
    "GAS_CYLINDER_DELIVERY" = @("cylinderValveInspection","leakDetectionSpray","cylinderSecuringTransport","hosePressureRegulator","customerCylinderSwap","gasLevelEstimationWeight","emergencyShutOffProcedure","propertyAccessAssessment","ppeGlovesUse","cylinderStorageAreaCheck","inverterGeneratorConnection","depositCollectionProcess","refillSlipDocumentation","odourFadeTest","safeTransportSecuring")
    "DEBUSHING" = @("bushClearingTechnique","invasiveSpeciesRemoval","slasherWeedEaterUse","burningPileControl","herbicideSprayCalibration","landClearingAssessment","mulchingCompostMethod","stumpRemovalGrinding","protectiveClothingWear","firebreakPloughing","manualLabourManagement","environmentalImpactCheck","nativeVegetationPreservation","fenceLineClearing","debrisHaulingDisposal")
    "FARM_HAND" = @("livestockFeedingRoutine","fenceRepairMending","tractorOperationMaintenance","cropPlantingTechnique","weedControlRemoval","waterTroughCleaning","hayBalingStacking","vaccinationProgrammeApplication","farmEquipmentCleaning","animalHealthObservation","feedMixCalculation","ploughingDiscHarow","calfCareBottleFeeding","chemicalHandlingStorage","recordKeepingLog")
    "LIVESTOCK_BRANDING" = @("brandingIronHeating","animalRestraintSafe","brandPlacementAccuracy","vaccinationApplication","earTaggingNotching","dehorningHornRemoval","castrationProcedure","parasiteDrenching","animalWeightEstimation","handlingCrowdPenWork","crushGateOperation","recordBrandingRegister","disinfectantUseBetween","calvingLambingAssistance","cattleCrateMaintenance")
    "MOBILE_CATERING" = @("foodSafetyHygiene","menuPlanningVariety","grillCookingTechnique","customerServiceSpeed","cashPaymentHandling","stockRotationFIFO","gasBurnerOperation","weatherSetupBreakdown","eventTimingCoordination","coolerIceManagement","utensilCleaningSanitisation","portionControlConsistency","allergenLabelAwareness","queueManagement","healthPermitDisplay")
    "TENT_DECOR" = @("tentPoleErection","fabricDrapePleating","chairTableLayout","lightingStringInstallation","danceFloorAssembly","linenIroningPlacement","flowerArrangementSetup","marqueeGuyRopeTension","centerpiecePlacement","stageRiserAssembly","cateringStationSetup","signageBannerHanging","generatorPowerDistribution","weatherContingencyPlan","strikePackDownSpeed")
    "MOBILE_TOILET" = @("toiletPlacementLevel","wasteTankDisposal","chemicalDosingBlue","pressureWasherCleaning","toiletPaperRestocking","handSanitiserRefill","ventilationOdourControl","transportTrailerLoading","pumpOutVacuumOperation","freshWaterTankFilling","wheelStopInstallation","disinfectantFogging","spillCleanupProcedure","eventCapacitySizing","serviceScheduleLog")
    "PA_DJ" = @("soundSystemSetup","mixerEQAdjustment","microphoneFeedbackControl","speakerPlacementCoverage","cableManagementTaping","musicSelectionReading","lightingDMXProgramming","fogMachineOperation","ceremonyTimingCoordination","backupLaptopPlaylist","wirelessMicFrequencyCheck","crossfadeBeatMatching","emergencyPowerUps","crowdEngagementReading","systemBreakdownPacking")
    "PHONE_LAPTOP_REPAIR" = @("screenReplacementTricky","batterySwapProcedure","chargingPortRepair","motherboardDiagnosis","softwareTroubleshootingVirus","microSolderingComponent","lcdLedBacklightTest","waterDamageCleaning","buttonRibbonCableRepair","hardDriveSSDUpgrade","osInstallConfiguration","dataBackupTransfer","cameraModuleReplacement","speakerMicrophoneSwap","frameHousingReplacement")
    "DSTV_SATELLITE" = @("dishAlignmentSignalStrength","lnbConnectionCable","decoderHardwareSetup","channelInstallationActivation","dualViewLnBInstallation","cableRunConcealment","wallBracketDrilling","signalMeterUse","splittingMultiRoom","decoderTroubleshooting","smartcardPairing","switcherMultiswitchCabling","poleMountInstallation","viewerCardRenewal","customerRemoteTraining")
    "MOBILE_MONEY_AGENT" = @("cashFloatManagement","transactionRecordingLedger","customerIdentificationVerification","mobileAppOperation","cashCounterfeitDetection","floatReconciliationEndOfDay","queuingCustomerFlow","networkUptimeMonitoring","agentBalanceCheck","depositWithdrawalProcessing","billPaymentCollection","pinSecurityProcedure","customerDataPrivacy","scratchCardStock","agentComplianceReporting")
    "CURTAIN_BLIND_INSTALLER" = @("windowMeasurementAccuracy","trackPoleCuttingFitting","curtainHangingDrape","rollerBlindInstallation","verticalBlindLouvreAlignment","romanBlindAssembly","pelmetBoxConstruction","pleatHeadingStyle","motorisedBlindWiring","curtainRailBracketing","blackoutBlindFitting","venetianBlindTiltMechanism","fabricMatchingSeaming","awningInstallationOutdoor","childSafetyCordDevice")
    "SHOPFITTER" = @("shelfRackAssembly","counterDisplayInstallation","glassShowcaseLevel","shelvingWallFixing","lightingTrackInstallation","gondolaEndCapSetup","acousticCeilingIntegration","signageMountingSecuring","mirrorInstallationSafe","chillerFreezerHousing","countertopLaminateFinish","displayMannequinSetup","tileCarpetFloorCover","securityTaggingHardware","checkoutCounterConstruction")
    "LIVESTOCK_BRANDING" = @("brandingIronHeating","animalRestraintSafe","brandPlacementAccuracy","vaccinationApplication","earTaggingNotching","dehorningHornRemoval","castrationProcedure","parasiteDrenching","animalWeightEstimation","handlingCrowdPenWork","crushGateOperation","recordBrandingRegister","disinfectantUseBetween","calvingLambingAssistance","cattleCrateMaintenance")
  }
  
  if ($skillSets.ContainsKey($key)) {
    return $skillSets[$key]
  }
  return Generate-Skills $key
}

# Generate output
$outputLines = @()
$metaTotal = 0
foreach ($entry in $tradeMap.GetEnumerator() | Sort-Object Name) {
  $displayName = $entry.Key
  $skillKey = $entry.Value
  
  if ($existingKeys -contains $skillKey) {
    # Already exists - just note it
    continue
  }
  
  $skills = Get-CustomSkills $skillKey
  $skillJson = $skills | ForEach-Object { "      `"$_`"" }
  $outputLines += "    `"$skillKey`": ["
  $outputLines += ($skillJson -join ",`n")
  $outputLines += "    ],"
  $metaTotal++
}

Write-Host "Generated $metaTotal new trade entries"
$outputLines | Set-Content "$scriptDir\_new_trades_output.txt"
Write-Host "Output written to _new_trades_output.txt"
