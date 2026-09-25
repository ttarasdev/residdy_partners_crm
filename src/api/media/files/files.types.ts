export enum PrivateBucket {
    INSTRUCTION_HEADERS = 'instruction_headers',
    INSTRUCTION_IMAGES = 'instruction_images',
    BLOG_IMAGES = 'blog_images',
    MANAGER_FILES = 'manager_files',
    LEGAL_DOCUMENT_DRAFTS = 'legal_document_drafts',
    ACCOUNT_AVA = 'account_ava',
    GDOC_TEMPLATES = 'gdoc_templates',
    USER_DOCS = 'user_docs',
    CONSULTATION_FILES = 'consultation_files',
    PARTNER_LOGOS = 'partner_logos',
    PARTNER_MAIN = 'partner_main',
    PARTNER_ADV = 'partner_adv',
}

export enum PublicBucket {
    LEGAL_DOCUMENTS = 'legal_documents',
    ICONS = 'icons',
    SYSTEM_FILES = 'system_files',
}

export interface PrivateFileQuery {
    e: number
    sig: string
}
