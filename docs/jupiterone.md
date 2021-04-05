# Integration with JupiterOne

## GitLab + JupiterOne Integration Benefits

- Visualize GitLab users, groups, code repositories, and merge requests in the
  JupiterOne graph.
- Map Gitlab users to employees in your JupiterOne account.
- Map Gitlab users to development/security trainings.
- Monitor Gitlab software development activities within repositories including
  changes and approvals.
- Monitor changes to Gitlab user groups, users, code repositories, and merge
  requests using JupiterOne alerts.

## How it Works

- JupiterOne periodically fetches GitLab users, code repositories, and
 pull requests in those repositories to update the graph.
- Write JupiterOne queries to review and monitor updates to the graph.
- Configure alerts to take action when the JupiterOne graph changes.

## Requirements

- JupiterOne requires the a personal access token configured with read access and the API base URL.
- You must have permission in JupiterOne to install new integrations.

## Setup

JupiterOne provides a managed integration for GitLab. The integration connects
directly to GitLab API to obtain configuration metadata and analyze resource
relationships.

### Entities

<!-- {J1_DOCUMENTATION_MARKER_START} -->
<!--
********************************************************************************
NOTE: ALL OF THE FOLLOWING DOCUMENTATION IS GENERATED USING THE
"j1-integration document" COMMAND. DO NOT EDIT BY HAND! PLEASE SEE THE DEVELOPER
DOCUMENTATION FOR USAGE INFORMATION:

https://github.com/JupiterOne/sdk/blob/master/docs/integrations/development.md
********************************************************************************
-->

## Data Model

### Entities

The following entities are created:

| Resources     | Entity `_type`         | Entity `_class`       |
| ------------- | ---------------------- | --------------------- |
| Account       | `gitlab_account`       | `Account`             |
| Group         | `gitlab_group`         | `Group`               |
| Merge Request | `gitlab_merge_request` | `CodeReview`, `PR`    |
| Project       | `gitlab_project`       | `CodeRepo`, `Project` |
| User          | `gitlab_user`          | `User`                |

### Relationships

The following relationships are created/mapped:

| Source Entity `_type` | Relationship `_class` | Target Entity `_type`  |
| --------------------- | --------------------- | ---------------------- |
| `gitlab_account`      | **HAS**               | `gitlab_group`         |
| `gitlab_account`      | **HAS**               | `gitlab_project`       |
| `gitlab_group`        | **HAS**               | `gitlab_group`         |
| `gitlab_group`        | **HAS**               | `gitlab_project`       |
| `gitlab_group`        | **HAS**               | `gitlab_user`          |
| `gitlab_project`      | **HAS**               | `gitlab_merge_request` |
| `gitlab_project`      | **HAS**               | `gitlab_user`          |
| `gitlab_user`         | **APPROVED**          | `gitlab_merge_request` |
| `gitlab_user`         | **OPENED**            | `gitlab_merge_request` |

<!--
********************************************************************************
END OF GENERATED DOCUMENTATION AFTER BELOW MARKER
********************************************************************************
-->
<!-- {J1_DOCUMENTATION_MARKER_END} -->
