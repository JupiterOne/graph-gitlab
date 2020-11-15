# Integration with JupiterOne

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
