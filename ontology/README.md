# Volunteer ontology

Cause categories, skills, and requirements for the volunteer info flow. Aligned with the [Volunteer Profile Ontology](https://github.com/theodi/volunteer-profile-manager/blob/main/src/ontology/volunteer.ttl) and [Volunteering Data Model](https://id.volunteeringdata.io/schema/).

- **`volunteer.ttl`** – Single RDF/SKOS ontology: cause categories and causes, plus requirements / equipment & resources by category (Physical & Personal, Clothing, Equipment, Vehicles, Facilities). The app reads this file on the server at request/build time (`loadVolunteerOntology.server.ts`) and passes parsed data into the volunteer-info page via context.
