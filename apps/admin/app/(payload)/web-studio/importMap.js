import {
  InlineToolbarFeatureClient as InlineToolbarFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  HorizontalRuleFeatureClient as HorizontalRuleFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  UploadFeatureClient as UploadFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  BlockquoteFeatureClient as BlockquoteFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  RelationshipFeatureClient as RelationshipFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  LinkFeatureClient as LinkFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  ChecklistFeatureClient as ChecklistFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  OrderedListFeatureClient as OrderedListFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  UnorderedListFeatureClient as UnorderedListFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  IndentFeatureClient as IndentFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  AlignFeatureClient as AlignFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  HeadingFeatureClient as HeadingFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  ParagraphFeatureClient as ParagraphFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  InlineCodeFeatureClient as InlineCodeFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  SuperscriptFeatureClient as SuperscriptFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  SubscriptFeatureClient as SubscriptFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  StrikethroughFeatureClient as StrikethroughFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  UnderlineFeatureClient as UnderlineFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  BoldFeatureClient as BoldFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  ItalicFeatureClient as ItalicFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
} from "@payloadcms/richtext-lexical/client";
import {
  LexicalDiffComponent as LexicalDiffComponent_44fe37237e0ebf4470c9990d8cb7b07e,
  RscEntryLexicalField as RscEntryLexicalField_44fe37237e0ebf4470c9990d8cb7b07e,
  RscEntryLexicalCell as RscEntryLexicalCell_44fe37237e0ebf4470c9990d8cb7b07e,
} from "@payloadcms/richtext-lexical/rsc";
import { VercelBlobClientUploadHandler as VercelBlobClientUploadHandler_16c82c5e25f430251a3e3ba57219ff4e } from "@payloadcms/storage-vercel-blob/client";
import { CollectionCards as CollectionCards_ab83ff7e88da8d3530831f296ec4756a } from "@payloadcms/ui/rsc";

import { Icon as Icon_3e1d8f39fad9bddd5123caa2cad407ff } from "../../../src/cms-ui/brand/Icon.tsx";
import { Logo as Logo_37789914a9261410f4d39d03c1022d2c } from "../../../src/cms-ui/brand/Logo.tsx";
import { Header as Header_f8a8df1408c7374206a6393fbb1e2413 } from "../../../src/cms-ui/root/Header.tsx";
import { Nav as Nav_9db371ba9624687ac38a56dac5ca6a99 } from "../../../src/cms-ui/root/Nav.tsx";
import { TemplateGalleryView as TemplateGalleryView_768d43e7a4e2dc95766864a09f585d0f } from "../../../src/cms-ui/web-studio/flows/TemplateGalleryView.tsx";
import { MediaNativeEditView as MediaNativeEditView_c2a21fd99963fde6d38b86e944a3a05e } from "../../../src/cms-ui/web-studio/media/document/MediaNativeEditView.tsx";
import { MinistryUpdatesNativeEditView as MinistryUpdatesNativeEditView_2988c36246e97a895fa609e04a1355de } from "../../../src/cms-ui/web-studio/ministry-updates/document/MinistryUpdatesNativeEditView.tsx";
import { MinistryUpdatesNativeListView as MinistryUpdatesNativeListView_8fd8e6daa3d919ce9acb742ac58c8b1f } from "../../../src/cms-ui/web-studio/ministry-updates/list/MinistryUpdatesNativeListView.tsx";
import { MediaNativeListView as MediaNativeListView_88d2de41d45d5c84317084fa2fc7dd66 } from "../../../src/cms-ui/web-studio/media/list/MediaNativeListView.tsx";
import { MissionariesHubView as MissionariesHubView_649f31520254a31e388b194848dba548 } from "../../../src/cms-ui/web-studio/flows/MissionariesHubView.tsx";
import { MissionaryGivingCreateView as MissionaryGivingCreateView_542909ad000c3c81038dd240f9785f00 } from "../../../src/cms-ui/web-studio/flows/MissionaryGivingCreateView.tsx";
import { StandardPageFromTemplateView as StandardPageFromTemplateView_49a7f949c7c0ce9ac71739fa03761464 } from "../../../src/cms-ui/web-studio/flows/StandardPageFromTemplateView.tsx";
import { ProjectPageCreateView as ProjectPageCreateView_94786e79bca1b62db27cfe5aaeb47d59 } from "../../../src/cms-ui/web-studio/flows/ProjectPageCreateView.tsx";
import { MinistryUpdateCreateView as MinistryUpdateCreateView_d83db835455a052213c8588bac1de0d2 } from "../../../src/cms-ui/web-studio/flows/MinistryUpdateCreateView.tsx";
import { MissionaryGivingPagesNativeEditView as MissionaryGivingPagesNativeEditView_19739b4172f6fb48f13053fa282ad7c8 } from "../../../src/cms-ui/web-studio/missionary-giving-pages/document/MissionaryGivingPagesNativeEditView.tsx";
import { MissionaryGivingPagesNativeListView as MissionaryGivingPagesNativeListView_5d19d7eaa982bbdd573e1959d386d198 } from "../../../src/cms-ui/web-studio/missionary-giving-pages/list/MissionaryGivingPagesNativeListView.tsx";
import { MissionaryProfilesNativeEditView as MissionaryProfilesNativeEditView_b032f05f7b7b0c88f3b1b93bca43a08b } from "../../../src/cms-ui/web-studio/missionary-profiles/document/MissionaryProfilesNativeEditView.tsx";
import { MissionaryProfilesNativeListView as MissionaryProfilesNativeListView_b8dc187b9406e8cface2d31cc33b69b2 } from "../../../src/cms-ui/web-studio/missionary-profiles/list/MissionaryProfilesNativeListView.tsx";
import { NavigationNativeEditView as NavigationNativeEditView_89733a0d11a108be918b6cb74b6e73aa } from "../../../src/cms-ui/web-studio/navigation/document/NavigationNativeEditView.tsx";
import { NavigationNativeListView as NavigationNativeListView_2a580cedc1cf71d6ae56d8fa0fc5ec54 } from "../../../src/cms-ui/web-studio/navigation/list/NavigationNativeListView.tsx";
import { PageTemplatesNativeEditView as PageTemplatesNativeEditView_84d26b7ab75fcdc7408c195c58424a29 } from "../../../src/cms-ui/web-studio/page-templates/document/PageTemplatesNativeEditView.tsx";
import { PageTemplatesNativeListView as PageTemplatesNativeListView_e95bd28ce8d6da532d7ff2d818d9c42f } from "../../../src/cms-ui/web-studio/page-templates/list/PageTemplatesNativeListView.tsx";
import { PagesNativeEditView as PagesNativeEditView_d2240ecf8805c7d12a67f984df1014cc } from "../../../src/cms-ui/web-studio/pages/document/PagesNativeEditView.tsx";
import { PagesNativeListView as PagesNativeListView_dab9c45d6a71ea658c503a573240982c } from "../../../src/cms-ui/web-studio/pages/list/PagesNativeListView.tsx";
import { ProjectPagesNativeEditView as ProjectPagesNativeEditView_4e33fe2c932ea64c5dec3a2eb647e157 } from "../../../src/cms-ui/web-studio/project-pages/document/ProjectPagesNativeEditView.tsx";
import { ProjectPagesNativeListView as ProjectPagesNativeListView_2274f73ac126e7283c3deebcd3aaa6ea } from "../../../src/cms-ui/web-studio/project-pages/list/ProjectPagesNativeListView.tsx";

/** @type import('payload').ImportMap */
export const importMap = {
  "@payloadcms/richtext-lexical/rsc#RscEntryLexicalCell":
    RscEntryLexicalCell_44fe37237e0ebf4470c9990d8cb7b07e,
  "@payloadcms/richtext-lexical/rsc#RscEntryLexicalField":
    RscEntryLexicalField_44fe37237e0ebf4470c9990d8cb7b07e,
  "@payloadcms/richtext-lexical/rsc#LexicalDiffComponent":
    LexicalDiffComponent_44fe37237e0ebf4470c9990d8cb7b07e,
  "@payloadcms/richtext-lexical/client#InlineToolbarFeatureClient":
    InlineToolbarFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@payloadcms/richtext-lexical/client#HorizontalRuleFeatureClient":
    HorizontalRuleFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@payloadcms/richtext-lexical/client#UploadFeatureClient":
    UploadFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@payloadcms/richtext-lexical/client#BlockquoteFeatureClient":
    BlockquoteFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@payloadcms/richtext-lexical/client#RelationshipFeatureClient":
    RelationshipFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@payloadcms/richtext-lexical/client#LinkFeatureClient":
    LinkFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@payloadcms/richtext-lexical/client#ChecklistFeatureClient":
    ChecklistFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@payloadcms/richtext-lexical/client#OrderedListFeatureClient":
    OrderedListFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@payloadcms/richtext-lexical/client#UnorderedListFeatureClient":
    UnorderedListFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@payloadcms/richtext-lexical/client#IndentFeatureClient":
    IndentFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@payloadcms/richtext-lexical/client#AlignFeatureClient":
    AlignFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@payloadcms/richtext-lexical/client#HeadingFeatureClient":
    HeadingFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@payloadcms/richtext-lexical/client#ParagraphFeatureClient":
    ParagraphFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@payloadcms/richtext-lexical/client#InlineCodeFeatureClient":
    InlineCodeFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@payloadcms/richtext-lexical/client#SuperscriptFeatureClient":
    SuperscriptFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@payloadcms/richtext-lexical/client#SubscriptFeatureClient":
    SubscriptFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@payloadcms/richtext-lexical/client#StrikethroughFeatureClient":
    StrikethroughFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@payloadcms/richtext-lexical/client#UnderlineFeatureClient":
    UnderlineFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@payloadcms/richtext-lexical/client#BoldFeatureClient":
    BoldFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@payloadcms/richtext-lexical/client#ItalicFeatureClient":
    ItalicFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "/src/cms-ui/web-studio/pages/document/PagesNativeEditView.tsx#PagesNativeEditView":
    PagesNativeEditView_d2240ecf8805c7d12a67f984df1014cc,
  "/src/cms-ui/web-studio/pages/list/PagesNativeListView.tsx#PagesNativeListView":
    PagesNativeListView_dab9c45d6a71ea658c503a573240982c,
  "/src/cms-ui/web-studio/page-templates/document/PageTemplatesNativeEditView.tsx#PageTemplatesNativeEditView":
    PageTemplatesNativeEditView_84d26b7ab75fcdc7408c195c58424a29,
  "/src/cms-ui/web-studio/page-templates/list/PageTemplatesNativeListView.tsx#PageTemplatesNativeListView":
    PageTemplatesNativeListView_e95bd28ce8d6da532d7ff2d818d9c42f,
  "/src/cms-ui/web-studio/missionary-giving-pages/document/MissionaryGivingPagesNativeEditView.tsx#MissionaryGivingPagesNativeEditView":
    MissionaryGivingPagesNativeEditView_19739b4172f6fb48f13053fa282ad7c8,
  "/src/cms-ui/web-studio/missionary-giving-pages/list/MissionaryGivingPagesNativeListView.tsx#MissionaryGivingPagesNativeListView":
    MissionaryGivingPagesNativeListView_5d19d7eaa982bbdd573e1959d386d198,
  "/src/cms-ui/web-studio/project-pages/document/ProjectPagesNativeEditView.tsx#ProjectPagesNativeEditView":
    ProjectPagesNativeEditView_4e33fe2c932ea64c5dec3a2eb647e157,
  "/src/cms-ui/web-studio/project-pages/list/ProjectPagesNativeListView.tsx#ProjectPagesNativeListView":
    ProjectPagesNativeListView_2274f73ac126e7283c3deebcd3aaa6ea,
  "/src/cms-ui/web-studio/navigation/document/NavigationNativeEditView.tsx#NavigationNativeEditView":
    NavigationNativeEditView_89733a0d11a108be918b6cb74b6e73aa,
  "/src/cms-ui/web-studio/navigation/list/NavigationNativeListView.tsx#NavigationNativeListView":
    NavigationNativeListView_2a580cedc1cf71d6ae56d8fa0fc5ec54,
  "/src/cms-ui/web-studio/missionary-profiles/document/MissionaryProfilesNativeEditView.tsx#MissionaryProfilesNativeEditView":
    MissionaryProfilesNativeEditView_b032f05f7b7b0c88f3b1b93bca43a08b,
  "/src/cms-ui/web-studio/missionary-profiles/list/MissionaryProfilesNativeListView.tsx#MissionaryProfilesNativeListView":
    MissionaryProfilesNativeListView_b8dc187b9406e8cface2d31cc33b69b2,
  "/src/cms-ui/web-studio/ministry-updates/document/MinistryUpdatesNativeEditView.tsx#MinistryUpdatesNativeEditView":
    MinistryUpdatesNativeEditView_2988c36246e97a895fa609e04a1355de,
  "/src/cms-ui/web-studio/ministry-updates/list/MinistryUpdatesNativeListView.tsx#MinistryUpdatesNativeListView":
    MinistryUpdatesNativeListView_8fd8e6daa3d919ce9acb742ac58c8b1f,
  "/src/cms-ui/web-studio/media/document/MediaNativeEditView.tsx#MediaNativeEditView":
    MediaNativeEditView_c2a21fd99963fde6d38b86e944a3a05e,
  "/src/cms-ui/web-studio/media/list/MediaNativeListView.tsx#MediaNativeListView":
    MediaNativeListView_88d2de41d45d5c84317084fa2fc7dd66,
  "/src/cms-ui/root/Header.tsx#Header": Header_f8a8df1408c7374206a6393fbb1e2413,
  "/src/cms-ui/brand/Icon.tsx#Icon": Icon_3e1d8f39fad9bddd5123caa2cad407ff,
  "/src/cms-ui/brand/Logo.tsx#Logo": Logo_37789914a9261410f4d39d03c1022d2c,
  "/src/cms-ui/root/Nav.tsx#Nav": Nav_9db371ba9624687ac38a56dac5ca6a99,
  "@payloadcms/storage-vercel-blob/client#VercelBlobClientUploadHandler":
    VercelBlobClientUploadHandler_16c82c5e25f430251a3e3ba57219ff4e,
  "/src/cms-ui/web-studio/flows/TemplateGalleryView.tsx#TemplateGalleryView":
    TemplateGalleryView_768d43e7a4e2dc95766864a09f585d0f,
  "/src/cms-ui/web-studio/flows/MissionariesHubView.tsx#MissionariesHubView":
    MissionariesHubView_649f31520254a31e388b194848dba548,
  "/src/cms-ui/web-studio/flows/MissionaryGivingCreateView.tsx#MissionaryGivingCreateView":
    MissionaryGivingCreateView_542909ad000c3c81038dd240f9785f00,
  "/src/cms-ui/web-studio/flows/StandardPageFromTemplateView.tsx#StandardPageFromTemplateView":
    StandardPageFromTemplateView_49a7f949c7c0ce9ac71739fa03761464,
  "/src/cms-ui/web-studio/flows/ProjectPageCreateView.tsx#ProjectPageCreateView":
    ProjectPageCreateView_94786e79bca1b62db27cfe5aaeb47d59,
  "/src/cms-ui/web-studio/flows/MinistryUpdateCreateView.tsx#MinistryUpdateCreateView":
    MinistryUpdateCreateView_d83db835455a052213c8588bac1de0d2,
  "@payloadcms/ui/rsc#CollectionCards":
    CollectionCards_ab83ff7e88da8d3530831f296ec4756a,
};
