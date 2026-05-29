$colors = @('#fd7600','#009144','#003DA5','#8c2d1a','#1a6b5a','#6b3a8c','#1a4b8c','#2a4a8c','#4a6b3a','#8c5a2d')
$allProfiles = @()

Get-ChildItem "data\demo_data\demo_profiles_*.json" | ForEach-Object {
    $profiles = Get-Content $_.FullName -Raw | ConvertFrom-Json
    foreach ($p in $profiles) {
        $fn = if ($p.firstName) { $p.firstName } else { "" }
        $sn = if ($p.surname) { $p.surname } else { "" }
        $name = "$fn $sn".Trim()
        if ($name -eq "") { $name = $p.username }
        
        $fc = if ($fn -ne "") { $fn[0].ToString() } else { "" }
        $sc = if ($sn -ne "") { $sn[0].ToString() } else { "" }
        $initials = ($fc + $sc).ToUpper()
        if ($initials -eq "") { $initials = $name[0].ToString().ToUpper() }
        
        $hash = 0
        foreach ($c in $name.ToCharArray()) { $hash = [math]::Abs(($hash * 31 + [int]$c) % $colors.Length) }
        $color = $colors[$hash]
        
        $town = ""
        if ($p.location -and $p.location.town) { $town = $p.location.town }
        if ($town -eq "") { $town = "Gaborone" }
        
        $role = "General User"
        if ($p.role -eq "business_owner") { $role = "Business & Materials Supplier" }
        elseif ($p.role -eq "tradesperson" -or $p.role -eq "service_provider") { $role = "Tradesperson (Contractor)" }
        elseif ($p.role -eq "staff") { $role = "Board Kings Staff" }
        
        $email = ""
        if ($p.contacts -and $p.contacts.email) { $email = $p.contacts.email }
        
        $phone = ""
        if ($p.contacts -and $p.contacts.mobiles -and $p.contacts.mobiles.Count -gt 0) {
            $phone = $p.contacts.mobiles[0].number
        }
        
        $allProfiles += [PSCustomObject]@{
            id = $p.id
            name = $name
            role = $role
            initials = $initials
            color = $color
            town = $town
            firstName = $fn
            surname = $sn
            email = $email
            phone = $phone
            image = $p.image
            gender = $p.gender
            businessInfo = $p.businessInfo
        }
    }
}

$json = $allProfiles | ConvertTo-Json -Depth 100
$output = @"
/* ==========================================================
   FOROMANE DEMO PROFILES - All demo user accounts (auto-generated)
   Total: $($allProfiles.Count) profiles
   ========================================================== */

window.DEMO_PROFILES = $json;
"@

$output | Out-File -FilePath "demo-profiles.js" -Encoding UTF8
Write-Output "Written $($allProfiles.Count) profiles to demo-profiles.js"
