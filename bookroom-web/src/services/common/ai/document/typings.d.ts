/* eslint-disable */
// 该文件由 OneAPI 自动生成，请勿手动修改！

declare namespace API {
  interface AIGraphDocumentInfo {
    doc_status_document: {
      title?: string;
      content_summary: string;
      content_length: number;
      status: string;
      error?: string;
      created_at: string;
      updated_at: string;
      chunks_count: number;
    };
    document: {
      _id: string;
      content: string;
      title?: string;
    };
    chunks: Array<{
      id: string;
      chunk_order_index: number;
      content: string;
      full_doc_id: string;
      tokens: number;
    }>;
  }

  interface Result_AIGraphDocumentInfo_ {
    code?: number;
    message?: string;
    data?: AIGraphDocumentInfo;
  }

  interface AIGraphDocument_TextType {
    text: string;
    split_by_character?: string;
    split_by_character_only?: boolean;
  }
  interface AIGraphDocument_UploadType {
    files: UploadFile[] | UploadFile;
    description?: string;
    split_by_character?: string;
    split_by_character_only?: boolean;
  }
}
