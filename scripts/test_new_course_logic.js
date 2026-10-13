import { getEligibleCourses, getAvailableCertificationsForAge } from '../Frontend/src/utils/courseEligibility.js'

console.log('=== TEST 1: User 8 and above (without certificate) ===')
const t1_8 = getEligibleCourses(8, false, [], 'Scuba Diving')
console.log('Age 8 (without certificate):', t1_8.map(c => c.name))
const t1_20 = getEligibleCourses(20, false, [], 'Scuba Diving')
console.log('Age 20 (without certificate):', t1_20.map(c => c.name))

console.log('\n=== TEST 2: User exact 8 (with certificate) ===')
const t2 = getEligibleCourses(8, true, [], 'Scuba Diving')
console.log('Age 8 (with certificate):', t2.map(c => c.name))

console.log('\n=== TEST 3: User above 8+ (with certificate) options ===')
const certOpts = getAvailableCertificationsForAge(15, 'Scuba Diving')
console.log('Available certificates to pick from:', certOpts.map(c => c.name))

const tests = [
  'scuba-diver',
  'skin-diver',
  'open-water-diver',
  'advanced-open-water-diver',
  'adventure-diver',
  'rescue-diver',
  'efr',
  'dive-master'
]

tests.forEach(certId => {
  const courses = getEligibleCourses(15, true, [certId], 'Scuba Diving')
  console.log(`\nIf picked [${certId}]:`)
  courses.forEach(c => console.log('  -> ' + c.name))
})
