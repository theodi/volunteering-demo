# Volunteer ontology

Cause categories and causes for the volunteer info flow. Aligned with the [Volunteer Profile Ontology](https://github.com/theodi/volunteer-profile-manager/blob/main/src/ontology/volunteer.ttl) and [Volunteering Data Model](https://id.volunteeringdata.io/schema/).

- **`volunteer.ttl`** – RDF/SKOS definitions (categories and causes). The app reads this file directly via the API route `GET /api/volunteer-causes`, which loads from `ontology/volunteer.ttl` on the server.
